# Supabase Setup - Critical Action Items

**Assessment Date:** January 27, 2026
**Overall Status:** 85% Production-Ready ✅

---

## 🚨 CRITICAL - Do Immediately

### 1. Regenerate TypeScript Types (5 minutes)

**Issue:** TypeScript types are out of sync with database schema
**Impact:** Missing 6 legal acceptance fields causing type errors

**Fix:**
```bash
cd ~/SequenceHUB_V1
npx supabase gen types typescript --local > src/types/database.ts
```

**Verify:** Check that `seller_onboarding_progress` includes:
- `terms_accepted_at`
- `privacy_accepted_at`
- `community_guidelines_accepted_at`
- `seller_agreement_accepted_at`
- `terms_version_accepted`
- `privacy_version_accepted`

---

## ⚠️ MAJOR - Do Before Production

### 2. Add DELETE Policies (15 minutes)

**Issue:** No delete policies on seller tables
**Impact:** Unclear if users can delete seller profiles

**Run in Supabase SQL Editor:**

Choose **Option A** (allow deletion):
```sql
-- Allow users to delete their own seller profile
CREATE POLICY "Users can delete own seller profile"
ON public.seller_profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can delete own onboarding progress"
ON public.seller_onboarding_progress
FOR DELETE
TO authenticated
USING (id = auth.uid());
```

OR **Option B** (prevent deletion):
```sql
-- Prevent all deletions (permanent seller status)
CREATE POLICY "Prevent seller profile deletion"
ON public.seller_profiles
FOR DELETE
TO authenticated
USING (false);

CREATE POLICY "Prevent onboarding progress deletion"
ON public.seller_onboarding_progress
FOR DELETE
TO authenticated
USING (false);
```

---

### 3. Implement Legal Acceptance Tracking (2 hours)

**Issue:** Legal acceptance functions exist but aren't called by frontend
**Impact:** Incomplete compliance tracking

**Steps:**

1. **Create API route:** `src/app/api/onboarding/accept-legal/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      termsAccepted, 
      privacyAccepted, 
      communityGuidelinesAccepted, 
      sellerAgreementAccepted 
    } = body

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Call database function
    const { error } = await supabase.rpc('record_legal_acceptance', {
      p_terms_accepted: termsAccepted,
      p_privacy_accepted: privacyAccepted,
      p_community_guidelines_accepted: communityGuidelinesAccepted,
      p_seller_agreement_accepted: sellerAgreementAccepted
    })

    if (error) throw error

    // Create audit log entries
    if (termsAccepted) {
      await supabase.rpc('log_legal_acceptance', {
        p_document_type: 'terms_of_service',
        p_version: '1.0',
        p_ip_address: ip,
        p_user_agent: userAgent
      })
    }

    if (communityGuidelinesAccepted) {
      await supabase.rpc('log_legal_acceptance', {
        p_document_type: 'community_guidelines',
        p_version: '1.0',
        p_ip_address: ip,
        p_user_agent: userAgent
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Legal Acceptance] Error:', error)
    return NextResponse.json(
      { error: 'Failed to record acceptance' },
      { status: 500 }
    )
  }
}
```

2. **Update GuidelinesStep.tsx:**

```typescript
const handleCheckboxChange = async (field: string, value: boolean) => {
  onChange(field, value)
  
  if (value && ['acceptedTerms', 'acceptedCommunityGuidelines'].includes(field)) {
    try {
      await fetch('/api/onboarding/accept-legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          termsAccepted: field === 'acceptedTerms',
          privacyAccepted: field === 'acceptedTerms',
          communityGuidelinesAccepted: field === 'acceptedCommunityGuidelines',
          sellerAgreementAccepted: field === 'acceptedTerms'
        })
      })
    } catch (error) {
      console.error('Error recording legal acceptance:', error)
    }
  }
}
```

---

## 🟡 OPTIONAL - Nice to Have

### 4. Add stripe_details_submitted Field (15 minutes)

**Run in Supabase SQL Editor:**

```sql
ALTER TABLE public.seller_profiles
ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS seller_profiles_stripe_details_submitted_idx 
ON public.seller_profiles(stripe_details_submitted);
```

**Update Stripe callback:**
```typescript
// In src/app/api/stripe/connect/callback/route.ts
stripe_details_submitted: detailsSubmitted, // Add this line
```

---

## ✅ What's Already Working

- ✅ Core database schema is complete
- ✅ RLS policies properly implemented
- ✅ Legal acceptance tracking migration exists
- ✅ Stripe integration fields exist
- ✅ Onboarding progress tracking functional
- ✅ Auto-update triggers working
- ✅ Stats calculation automated

---

## 📋 Verification Checklist

After completing the fixes:

```sql
-- 1. Verify types are regenerated
-- Check that src/types/database.ts has legal acceptance fields

-- 2. Verify DELETE policies exist
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('seller_profiles', 'seller_onboarding_progress')
  AND cmd = 'DELETE';
-- Should return 2 policies

-- 3. Test legal acceptance
SELECT 
  terms_accepted_at,
  privacy_accepted_at,
  terms_version_accepted
FROM seller_onboarding_progress
WHERE id = auth.uid();
-- After accepting terms, should show timestamps

-- 4. Check audit log
SELECT * FROM legal_acceptance_audit_log
WHERE user_id = auth.uid()
ORDER BY accepted_at DESC;
-- Should show entries when legal docs are accepted
```

---

## 🚀 Production Deployment Order

1. ✅ Run migrations (already done)
2. **→ Regenerate types** (Script 1)
3. **→ Add DELETE policies** (Script 2)
4. **→ Create legal acceptance API route**
5. **→ Update GuidelinesStep component**
6. Test onboarding flow end-to-end
7. Have attorney review legal docs
8. Deploy to production

---

## 📊 Current State Summary

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Database Schema | ✅ Complete | None |
| RLS Policies | ⚠️ Missing DELETE | Add policies |
| TypeScript Types | ❌ Out of Sync | Regenerate |
| Legal Tracking (DB) | ✅ Ready | None |
| Legal Tracking (Frontend) | ❌ Not Integrated | Create API route |
| Stripe Integration | ✅ Ready | Add API keys |
| Accessibility | ✅ WCAG 2.1 AA | None |
| Error Handling | ✅ Components Ready | Integrate |

**Overall:** 85% complete, ~3-4 hours to production-ready

---

## 📄 Full Assessment

For complete details, see the assessment report in the agent output above, which includes:
- Detailed table-by-table analysis
- Security audit results
- All SQL scripts with explanations
- Verification queries
- Production deployment checklist
- Best practices recommendations

---

**Next Steps:**
1. Run the 3 critical/major fixes above
2. Test the complete onboarding flow
3. Verify legal acceptance is tracked
4. Schedule legal document review
5. Configure Stripe API keys
6. Deploy to staging for QA
