import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import { SupabaseDB } from './supabase-db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session }) {
      if (session.user) {
        try {
          // Try Prisma first
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { id: true, role: true },
          })
          
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role
          }
        } catch (prismaError) {
          console.error('Prisma error in session callback, falling back to Supabase:', prismaError)
          
          // Fallback to Supabase
          try {
            const supabaseUser = await SupabaseDB.getUserByEmail(session.user.email!)
            if (supabaseUser) {
              session.user.id = supabaseUser.id
              session.user.role = supabaseUser.role || 'USER'
            }
          } catch (supabaseError) {
            console.error('Supabase fallback also failed:', supabaseError)
          }
        }
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Try Prisma first
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'USER',
              },
            })
          }
          return true
        } catch (prismaError) {
          console.error('Prisma error during sign in, falling back to Supabase:', prismaError)
          
          // Fallback to Supabase
          try {
            const existingUser = await SupabaseDB.getUserByEmail(user.email!)
            
            if (!existingUser) {
              await SupabaseDB.createUser({
                email: user.email!,
                name: user.name,
                image: user.image,
                role: 'USER',
              })
            }
            return true
          } catch (supabaseError) {
            console.error('Supabase fallback also failed:', supabaseError)
            return false
          }
        }
      }
      return true
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
  },
}