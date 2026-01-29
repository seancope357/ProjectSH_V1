# Marketplace Components - Quick Reference

## Component Import Paths

```typescript
// UI Components
import StatsCounter from '@/components/ui/StatsCounter'
import BenefitPillar from '@/components/ui/BenefitPillar'
import BadgeIcon, { BadgeOverlay } from '@/components/ui/BadgeIcon'

// Marketplace Components
import TrustBar from '@/components/marketplace/TrustBar'

// Icons (examples)
import { Users, Download, Star, Zap, Shield, Crown } from 'lucide-react'
```

---

## Quick Copy-Paste Examples

### 1. Simple Trust Stats Bar

```tsx
<TrustBar
  stats={[
    { label: 'Active Sellers', value: 5000, icon: Users, suffix: '+' },
    { label: 'Total Downloads', value: 500000, icon: Download, suffix: 'K' },
    { label: 'Average Rating', value: 4.9, icon: Star, decimals: 1 },
  ]}
/>
```

### 2. Single Animated Counter

```tsx
<StatsCounter
  targetValue={25000}
  label="Happy Customers"
  suffix="+"
  duration={2}
/>
```

### 3. Feature Grid (3 Benefits)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <BenefitPillar
    icon={Zap}
    title="Instant Download"
    description="Get your sequences immediately after purchase."
    accent="primary"
  />
  <BenefitPillar
    icon={Shield}
    title="Quality Guaranteed"
    description="30-day money-back guarantee on all purchases."
    accent="secondary"
  />
  <BenefitPillar
    icon={Globe}
    title="Global Reach"
    description="Available in 150+ countries worldwide."
    accent="accent"
  />
</div>
```

### 4. Product Card with Badge

```tsx
<div className="relative bg-surface rounded-2xl p-6">
  {/* Badge in corner */}
  <BadgeOverlay type="bestseller" position="top-right" />

  {/* Your product content */}
  <img src="/product.jpg" alt="Product" />
  <h3>Product Title</h3>
  <p>$49.99</p>
</div>
```

### 5. Standalone Badges

```tsx
{/* Different badge types */}
<BadgeIcon type="trending" size="md" />
<BadgeIcon type="new" size="md" />
<BadgeIcon type="bestseller" size="md" />
<BadgeIcon type="featured" size="md" />
```

---

## When to Use Each Component

### TrustBar
**Use when:** You need to establish credibility with marketplace statistics
**Best locations:**
- Top of landing page (after hero)
- Seller onboarding welcome screen
- Checkout page (security reassurance)
- Footer (reinforcement)

**Variants:**
- `glassmorphism` - Landing pages, hero sections
- `solid` - Content sections, mid-page
- `minimal` - Footer, secondary areas

### StatsCounter
**Use when:** You want a standalone impactful number
**Best locations:**
- About page (company milestones)
- Seller benefits section (potential earnings)
- Anniversary/milestone announcements
- Success stories

**Pro tip:** Use larger numbers with suffixes (K, M) for maximum impact

### BenefitPillar
**Use when:** Explaining features or benefits
**Best locations:**
- "Why Choose Us" sections
- Feature comparison pages
- Seller benefits page
- Onboarding flow (value props)

**Layout tips:**
- 3 columns for balanced visual weight
- 2 columns when benefits have longer descriptions
- 4 columns for compact feature lists

### BadgeIcon
**Use when:** You need visual status indicators
**Best locations:**
- Product cards (overlay)
- Search results (filtering aid)
- Category pages (highlight special items)
- Seller dashboard (achievement recognition)

**Badge selection guide:**
- `trending` - High velocity (views/purchases in last 24-48h)
- `new` - Recently added (< 30 days)
- `bestseller` - Top performers (top 10% of category)
- `featured` - Editorial picks, staff curated

---

## Responsive Behavior

### Mobile (< 768px)
- TrustBar: 2 columns
- BenefitPillar grids: 1 column
- Badge sizes: Use 'sm' or 'md' only
- Font sizes: Automatically scale down

### Tablet (768px - 1024px)
- TrustBar: 2-3 columns based on count
- BenefitPillar grids: 2 columns
- Badge sizes: 'md' recommended
- Maintain spacing with gap-4 or gap-6

### Desktop (> 1024px)
- TrustBar: Up to 4 columns
- BenefitPillar grids: 3-4 columns
- Badge sizes: 'md' or 'lg'
- Use gap-6 or gap-8 for breathing room

---

## Color Accent Guide

### Primary (Cyan #00e5ff)
**Emotion:** Trust, reliability, stability
**Use for:**
- Security features
- Support/help features
- Guarantees
- Professional services

### Secondary (Purple #b84fff)
**Emotion:** Innovation, creativity, premium
**Use for:**
- AI features
- New technology
- Creative tools
- Pro/premium features

### Accent (Gold #ffd54f)
**Emotion:** Value, success, achievement
**Use for:**
- Pricing benefits
- Achievements/awards
- Exclusive features
- Success metrics

---

## Animation Timing Guide

| Component | Default Duration | Recommended Range | Use Case |
|-----------|-----------------|-------------------|----------|
| StatsCounter | 2s | 1.5-3s | Larger numbers = longer duration |
| BenefitPillar | 0.5s | 0.4-0.6s | Keep consistent across grid |
| BadgeIcon | 0.3s | 0.2-0.4s | Quick, attention-grabbing |
| TrustBar | 0.6s | 0.5-0.8s | Allow time to stagger children |

**General Rule:** Faster animations (< 0.5s) for UI feedback, slower (> 1s) for storytelling

---

## Common Patterns

### Pattern 1: Landing Page Hero
```tsx
<section className="py-20">
  <h1>Welcome to SequenceHUB</h1>
  <p>Your marketplace tagline</p>

  {/* Trust signals immediately after hero */}
  <TrustBar variant="glassmorphism" stats={[...]} />
</section>
```

### Pattern 2: Feature Section
```tsx
<section className="py-16">
  <h2 className="text-center mb-12">Why Choose Us</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <BenefitPillar icon={Zap} title="Fast" description="..." accent="primary" />
    <BenefitPillar icon={Shield} title="Secure" description="..." accent="secondary" />
    <BenefitPillar icon={Star} title="Quality" description="..." accent="accent" />
  </div>
</section>
```

### Pattern 3: Stats Showcase
```tsx
<section className="py-16 bg-surface/50">
  <h2 className="text-center mb-12">Our Impact</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <StatsCounter targetValue={10000} label="Customers" suffix="+" />
    <StatsCounter targetValue={98.5} label="Satisfaction" suffix="%" decimals={1} />
    <StatsCounter targetValue={1000000} label="Revenue" prefix="$" />
  </div>
</section>
```

### Pattern 4: Product Grid with Badges
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {products.map(product => (
    <div key={product.id} className="relative">
      {product.isTrending && <BadgeOverlay type="trending" position="top-right" />}
      {product.isNew && <BadgeOverlay type="new" position="top-left" />}

      {/* Product card content */}
    </div>
  ))}
</div>
```

---

## Troubleshooting

### Issue: Animations not triggering
**Solution:** Ensure component is wrapped in a scrollable container and has enough scroll distance

### Issue: Badges too large on mobile
**Solution:** Use size="sm" on mobile with responsive sizing:
```tsx
<BadgeIcon type="trending" size="sm" className="md:hidden" />
<BadgeIcon type="trending" size="md" className="hidden md:block" />
```

### Issue: Stats Counter not animating
**Solution:** Check that:
1. Component is in viewport
2. `targetValue` is a number (not string)
3. Component hasn't already animated (animations run once)

### Issue: Colors not matching design system
**Solution:** Verify CSS variables are defined in `globals.css`:
```css
--color-primary: #00e5ff;
--color-secondary: #b84fff;
--color-accent: #ffd54f;
```

---

## Performance Tips

1. **Lazy load components below fold:**
   ```tsx
   import dynamic from 'next/dynamic'
   const TrustBar = dynamic(() => import('@/components/marketplace/TrustBar'))
   ```

2. **Limit animated elements per viewport:**
   - Max 4-6 BenefitPillars in view simultaneously
   - Max 8 stat counters per page

3. **Use appropriate badge counts:**
   - 1-2 badges per product card maximum
   - Only apply badges to top 20-30% of products

4. **Optimize icon imports:**
   ```tsx
   // Good: Named imports (tree-shakeable)
   import { Users, Star } from 'lucide-react'

   // Bad: Default import (bundles all icons)
   import * as Icons from 'lucide-react'
   ```

---

## Accessibility Checklist

- [ ] All icons have accessible labels via ARIA
- [ ] Color is not the only indicator (use icons + text)
- [ ] Keyboard navigation works for all interactive elements
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Sufficient color contrast (4.5:1 for normal text)
- [ ] Focus indicators are visible and consistent

---

## Testing Checklist

Before deploying components:

- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1440px width)
- [ ] Scroll trigger animations work correctly
- [ ] Hover states function as expected
- [ ] Components render with SSR (no hydration errors)
- [ ] Bundle size impact is acceptable (< 50KB per component)
- [ ] Performance: 60fps animations on mid-tier devices

---

## Need More Examples?

See the comprehensive examples file:
`/Users/cope/SequenceHUB_V1/src/components/marketplace/MarketplaceComponentsExample.tsx`

This file includes:
- All component variations
- Combined usage examples
- Real-world layout patterns
- Copy-paste code snippets

---

*Quick Reference Version 1.0 | Last Updated: 2026-01-09*
