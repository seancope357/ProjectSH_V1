import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return NextResponse.redirect(url)
  }

  // Role-based route protection and navigation
  if (user) {
    const userRole = user.user_metadata?.role
    const isSellerRole = userRole === 'SELLER'
    const isAdminRole = userRole === 'ADMIN'
    const isSellerArea = request.nextUrl.pathname.startsWith('/seller')
    const isAdminArea = request.nextUrl.pathname.startsWith('/admin')
    const isOnboardingPage =
      request.nextUrl.pathname.startsWith('/seller/onboarding')

    // Admin area protection
    if (isAdminArea && !isAdminRole) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Seller area protection and onboarding flow
    if (isSellerArea) {
      // Non-sellers trying to access seller area
      if (!isSellerRole && !isAdminRole) {
        const url = request.nextUrl.clone()
        url.pathname = '/seller/onboarding'
        return NextResponse.redirect(url)
      }

      // Sellers/Admins - check onboarding completion
      if (isSellerRole || isAdminRole) {
        // Load seller profile minimal fields to determine onboarding completeness
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, username, bio, stripe_onboarding_complete')
          .eq('id', user.id)
          .single()

        // Consider onboarding complete only if key fields exist and Stripe step marked complete
        const hasRequiredProfile =
          !!profile?.full_name && !!profile?.username && !!profile?.bio
        const stripeComplete = !!profile?.stripe_onboarding_complete
        const onboardingComplete =
          !profileError && hasRequiredProfile && stripeComplete

        if (!onboardingComplete && !isOnboardingPage) {
          const url = request.nextUrl.clone()
          url.pathname = '/seller/onboarding'
          return NextResponse.redirect(url)
        }

        if (onboardingComplete && isOnboardingPage) {
          const url = request.nextUrl.clone()
          url.pathname = '/seller'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse
}
