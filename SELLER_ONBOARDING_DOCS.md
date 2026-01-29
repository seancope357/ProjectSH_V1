# Seller Onboarding Documentation

## Overview

The seller onboarding system provides a comprehensive, multi-step guided experience for new sellers joining SequenceHUB. It balances quick time-to-first-sale with quality standards that protect customer trust.

## Design Philosophy

### Dual-Sided Marketplace Approach

Every aspect of the onboarding flow serves two masters:

**Seller Benefits:**
- Quick, streamlined setup process (5-10 minutes)
- Progressive disclosure - no overwhelming options upfront
- Clear value proposition at each step
- Ability to save progress and return later
- Skip optional steps while marking required ones
- Educational guidance rather than friction

**Customer Benefits:**
- Quality guardrails ensure trustworthy sellers
- Complete seller profiles build buyer confidence
- Specialization tags improve search/discovery
- Community guidelines maintain marketplace quality
- Verified payout accounts reduce fraud risk

## Architecture

### Database Schema

**Tables Created:**
- `seller_profiles` - Extended seller information
- `seller_onboarding_progress` - Step completion tracking
- `seller_specialization` enum - Predefined categories

**Key Features:**
- Automatic seller stats calculation (total_sales, revenue, etc.)
- Stripe account status tracking
- Marketing consent flags
- Expertise level and years of experience

### Component Structure

```
src/
├── components/onboarding/
│   ├── ProgressIndicator.tsx       # Visual progress tracker
│   ├── StepWrapper.tsx             # Reusable step container
│   └── steps/
│       ├── WelcomeStep.tsx         # Value proposition & benefits
│       ├── ProfileStep.tsx         # Seller identity & branding
│       ├── SpecializationsStep.tsx # Content preferences & expertise
│       ├── PayoutStep.tsx          # Stripe Connect integration
│       ├── GuidelinesStep.tsx      # Terms, quality, community rules
│       └── CompletionStep.tsx      # Success & next steps
└── app/
    ├── seller-onboarding/
    │   └── page.tsx                # Main onboarding orchestrator
    └── become-seller/
        └── page.tsx                # Marketing landing page
```

### State Management

The onboarding page uses React hooks for local state:
- `formData` - All seller profile information
- `currentStep` - Active step (1-6)
- `completedSteps` - Array of completed step IDs
- `isLoading` - Initial data fetch
- `isSaving` - Progress save operation
- `isUploading` - Profile picture upload

Progress is auto-saved to Supabase after each step, allowing users to return later.

## User Flow

### 1. Welcome Step (Step 1)
**Purpose:** Set expectations and communicate value
**Seller Impact:** Builds excitement and confidence
**Customer Impact:** N/A (internal step)
**Required:** Yes
**Validation:** None (informational only)

**Content:**
- Marketplace benefits (reach, automation, community, payouts)
- Quick setup promise (5-10 minutes)
- Save & return capability

### 2. Profile Step (Step 2)
**Purpose:** Establish seller identity and brand
**Seller Impact:** Creates their public-facing presence
**Customer Impact:** Builds trust through complete, professional profiles
**Required:** Yes (seller name only, rest optional)
**Validation:** Seller name must be 2-100 characters

**Fields:**
- Profile picture (upload to Supabase Storage)
- Seller name/brand (required)
- Tagline (optional, 150 char max)
- Bio (optional, 1000 char max)
- Social links: Website, Facebook, Instagram, YouTube

**Design Notes:**
- Photo upload with instant preview
- Character counters for text fields
- Inline tips (e.g., "Square images work best")
- Buyer perspective callout: Complete profiles = 3x more sales

### 3. Specializations Step (Step 3)
**Purpose:** Enable discovery and filtering
**Seller Impact:** Helps buyers find their sequences
**Customer Impact:** Improves search relevance and browsing experience
**Required:** Yes (at least one specialization)
**Validation:** Must select 1+ specialization and expertise level

**Specializations Available:**
- Christmas, Halloween, Easter, Patriotic, Religious
- Music Visualization, Animated Props, Mega Trees
- House Outlines, Custom Props

**Expertise Levels:**
- Beginner (0-1 years)
- Intermediate (1-3 years)
- Advanced (3-5 years)
- Professional (5+ years)

**Additional Fields:**
- Years of experience (slider, 0-20+)

**Design Notes:**
- Visual card-based selection with icons
- Multi-select for specializations
- Single-select for expertise level
- Buyer perspective callout: Filters help customers find right sequences

### 4. Payout Step (Step 4)
**Purpose:** Enable seller to receive payments
**Seller Impact:** Required for publishing paid sequences
**Customer Impact:** Reduces fraud, ensures legitimate sellers
**Required:** No (can skip and complete later)
**Validation:** None (step is skippable)

**Stripe Integration:**
- Connect with Stripe for payout account
- Status tracking: not_started, pending, active, restricted
- Display of benefits: security, fast payouts, easy setup

**Design Notes:**
- Clear explanation of payout process (3-step flow)
- Platform fee transparency (10%)
- Skip option with warning about publishing limitations
- Can return to complete later from dashboard

**TODO:** Stripe Connect OAuth flow implementation pending

### 5. Guidelines Step (Step 5)
**Purpose:** Set quality expectations and legal compliance
**Seller Impact:** Clear rules prevent future issues
**Customer Impact:** Maintains marketplace quality and trust
**Required:** Yes (must accept all required agreements)
**Validation:** Must check all 3 required agreements

**Content Sections:**
- Quality Standards (originality, metadata, testing)
- Legal Requirements (licensing, copyright, compliance)
- Community Guidelines (respect, response time, accuracy)
- Best Practices (descriptive titles, fair pricing)

**Required Agreements:**
- Terms of Service
- Quality Standards
- Community Guidelines

**Optional Consents:**
- Marketing updates
- Newsletter subscription

**Design Notes:**
- Warning callout for violations (suspension, payment holds)
- Checkbox validation with visual feedback
- Buyer perspective callout: Standards ensure quality experience

### 6. Completion Step (Step 6)
**Purpose:** Celebrate success and guide next actions
**Seller Impact:** Clear path forward, momentum
**Customer Impact:** N/A (internal step)
**Required:** Yes (auto-marked complete)
**Validation:** None

**Content:**
- Success message with seller name
- Marketplace stats teaser (10k+ buyers, $50k+ earned)
- Next steps with actions:
  - Upload first sequence
  - Optimize profile (banner, bio)
  - Learn best practices
- Quick tips for success
- Support resources

**Design Notes:**
- Animated success icon
- Direct links to dashboard tabs
- Emphasis on first upload as priority
- Help resources prominently displayed

## Progress Tracking

### Database Functions

**`initialize_seller_onboarding()`**
- Creates `seller_profiles` record if missing
- Creates `onboarding_progress` record if missing
- Called automatically on onboarding page load

**`complete_seller_onboarding()`**
- Marks `is_completed = true`
- Sets `completed_at` timestamp
- Finalizes current_step to 7

**`update_seller_stats(seller_id)`**
- Calculates total sequences, sales, revenue
- Updates average rating from reviews
- Triggered automatically on sequence/purchase changes

### Progress Persistence

After each step completion:
1. Form data saved to `seller_profiles`
2. Step completion flag updated in `onboarding_progress`
3. `current_step` incremented
4. User can safely leave and return

### Onboarding Completion Check

The seller dashboard should check `seller_onboarding_progress.is_completed`:
- If `false` and user is marked as seller → redirect to `/seller-onboarding`
- If `true` → allow dashboard access
- Non-sellers → show "become a seller" prompt

## File Upload Handling

### Profile Picture Upload

**Storage Bucket:** `avatars`
**Path Pattern:** `profile-pictures/{user_id}-{timestamp}.{ext}`
**Max Size:** 5MB
**Allowed Types:** image/* (JPG, PNG, GIF)

**Process:**
1. Client-side validation (type, size)
2. Upload to Supabase Storage with `upsert: true`
3. Get public URL
4. Update `seller_profiles.profile_picture_url`
5. Immediate UI preview update

**Error Handling:**
- Invalid file type: "Please upload an image file"
- File too large: "Image must be less than 5MB"
- Upload failure: "Failed to upload image. Please try again."

## Redirect Logic

### Entry Points

**From `/become-seller`:**
- Not logged in → Show marketing page with "Get Started" CTA
- Logged in → Auto-redirect to `/seller-onboarding`

**From `/login?redirect=/seller-onboarding`:**
- After successful login → Redirect to onboarding
- Onboarding already complete → Redirect to dashboard

**From `/seller-dashboard`:**
- Onboarding incomplete → Redirect to `/seller-onboarding`
- Onboarding complete → Show dashboard

### Completion Redirect

After clicking "Go to Dashboard" on completion step:
1. Call `complete_seller_onboarding()` RPC
2. Redirect to `/seller-dashboard`
3. Dashboard detects completion, shows success message

## Styling & Design System

### Color Usage

- **Primary (Neon Cyan):** Active states, CTAs, progress bars
- **Secondary (Vibrant Purple):** Gradients, accent elements
- **Accent (Golden Amber):** Required field markers, warnings
- **White/Opacity:** Text hierarchy (95%, 80%, 60%, 40%)

### Component Patterns

**ProgressIndicator:**
- Horizontal stepper on desktop, vertical on mobile
- Check marks for completed steps
- Current step highlighted with primary color
- Percentage completion bar below

**StepWrapper:**
- Consistent header with step count
- Description text for context
- Navigation buttons (Back, Skip, Next/Continue)
- Loading states with spinner
- Error display above content

**Form Fields:**
- Labels with optional/required indicators
- Helper text below inputs
- Character counters for text fields
- Inline validation feedback

### Accessibility

- ARIA labels on progress indicator
- Keyboard navigation support
- Focus visible states
- Error announcements
- Color contrast compliance (WCAG AA)

## Error Handling

### Common Errors

**Database Errors:**
- RPC function failures → Display generic error, log to console
- Permission issues → Check RLS policies
- Missing records → Initialize via `initialize_seller_onboarding()`

**Validation Errors:**
- Missing required fields → Disable "Continue" button
- Invalid input → Show inline error message
- API failures → Display user-friendly error banner

**Network Errors:**
- Auto-save failures → Retry with exponential backoff
- Image upload timeouts → Show retry option
- Supabase connection issues → Suggest page refresh

### User Feedback

**Success States:**
- Step completion → Progress bar animation
- Profile picture upload → Immediate preview
- Final completion → Animated success icon

**Loading States:**
- Initial load → Centered spinner with message
- Step transitions → Button loading state
- Image upload → Disabled button with "Uploading..." text

**Error States:**
- Validation errors → Inline below field
- Save failures → Banner above step content
- Upload errors → Below upload button

## Testing Checklist

### Functional Tests

- [ ] New user can complete full onboarding flow
- [ ] Progress saves after each step
- [ ] User can return and resume from saved progress
- [ ] Validation prevents skipping required fields
- [ ] Profile picture upload works correctly
- [ ] Specialization multi-select functions
- [ ] Skip button works on Payout step
- [ ] Completion redirects to dashboard
- [ ] Already-completed users redirect to dashboard

### Edge Cases

- [ ] User closes browser mid-step → Progress saved
- [ ] User clicks Back button → Previous data retained
- [ ] User uploads oversized image → Validation error
- [ ] User tries to submit without required agreements → Blocked
- [ ] User has no internet during save → Error message
- [ ] Multiple tabs open → Consistent state

### UI/UX Tests

- [ ] Progress indicator accurate on all steps
- [ ] Mobile responsive on all screen sizes
- [ ] Loading states visible during operations
- [ ] Error messages clear and actionable
- [ ] Success animations play correctly
- [ ] Keyboard navigation works throughout
- [ ] Focus states visible and logical

## Future Enhancements

### Phase 2 Features

1. **Stripe Connect Integration**
   - OAuth flow for Stripe account creation
   - Express Dashboard embedded iframe
   - Webhook handlers for account status updates
   - Payout schedule configuration

2. **First Sequence Upload Tutorial**
   - Interactive step-by-step guide
   - Sample sequence templates
   - Pricing calculator based on market data
   - Preview generation assistance

3. **Profile Completeness Score**
   - Visual indicator (e.g., "85% complete")
   - Suggestions for missing fields
   - Gamification with badges/milestones

4. **Seller Verification**
   - Email verification requirement
   - Phone number optional verification
   - Badge for verified sellers

5. **Onboarding Analytics**
   - Track step completion rates
   - Identify drop-off points
   - A/B test different copy/layouts
   - Time-to-completion metrics

### Known Limitations

- Stripe Connect not yet implemented (placeholder in UI)
- No email notifications for incomplete onboarding
- No onboarding abandonment recovery emails
- Profile picture upload limited to public bucket (consider private with signed URLs)
- No bulk specialization toggle (select all/none)

## Maintenance Notes

### Database Migrations

**Migration File:** `/supabase/migrations/20260105_seller_onboarding.sql`

**To Apply:**
```bash
npx supabase db reset  # Local
npx supabase db push   # Production
```

**To Regenerate Types:**
```bash
npx supabase gen types typescript --local > src/types/database.ts
```

### Component Updates

When adding new onboarding steps:
1. Update `steps` array in `/app/seller-onboarding/page.tsx`
2. Create new step component in `/components/onboarding/steps/`
3. Add step completion field to `seller_onboarding_progress` table
4. Update validation logic in `validateCurrentStep()`
5. Update progress save logic in `saveProgress()`

### Copy Updates

All user-facing copy is inline in components for easy editing:
- Welcome benefits → `WelcomeStep.tsx`
- Field labels/hints → Individual step components
- Error messages → `page.tsx` validation functions
- Success messages → `CompletionStep.tsx`

## Support & Resources

### For Developers

- **CLAUDE.md:** Project-wide development guide
- **This Document:** Onboarding-specific implementation
- **Supabase Docs:** https://supabase.com/docs
- **Stripe Connect Docs:** https://stripe.com/docs/connect

### For Sellers

- Seller Resources page (to be created): `/seller-resources`
- Support page: `/support`
- Community guidelines: Embedded in onboarding
- Help articles: Link from dashboard

## Changelog

### 2026-01-05 - Initial Implementation

**Added:**
- Complete seller onboarding flow (6 steps)
- Database schema with seller_profiles and onboarding_progress
- Reusable onboarding components (ProgressIndicator, StepWrapper)
- Individual step components with validation
- Profile picture upload to Supabase Storage
- Progress auto-save functionality
- Updated become-seller marketing page
- Database type definitions for new tables

**Pending:**
- Stripe Connect OAuth integration
- Seller dashboard onboarding check/redirect
- Email notifications for incomplete onboarding
- Onboarding analytics tracking

---

**Last Updated:** January 5, 2026
**Maintained By:** SequenceHUB Development Team
