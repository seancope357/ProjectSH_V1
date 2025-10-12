# Navigation Style Guide

This style guide defines the visual system for both buyer and seller navigation. It enforces pixel-perfect consistency across components.

## Color Schemes

- Brand Primary: `--color-primary: #2563EB` (blue-600)
- Brand Secondary: `--color-secondary: #14B8A6` (teal-500)
- Accent: `--color-accent: #F59E0B` (amber-500)
- Surface: `--color-surface: #FFFFFF`
- Surface Muted: `--color-surface-muted: #F8FAFC`
- Text Primary: `--color-text: #0F172A`
- Text Muted: `--color-text-muted: #475569`
- Border: `--color-border: #E2E8F0`
- Focus Ring: `--color-focus: #93C5FD`

Implementation:

- Declare CSS variables in `src/app/globals.css :root{}` and consume via Tailwind using `theme.extend.colors` mapping or direct `var()` in utility classes.

## Typography

- Font Family: `Inter, system-ui, -apple-system, Segoe UI, Roboto`
- Scales:
  - Title: 18px (mobile) → 20px (desktop)
  - Body: 14px (mobile) → 16px (desktop)
  - Caption: 12px
- Weights: 500 (nav items), 600 (section titles), 700 (primary brand wordmark)
- Letter Spacing: slight tightening on uppercase labels in SecondaryNav

## Iconography

- Use a consistent icon set (Lucide or Heroicons). Tree-shake imports per component.
- Size: 16px (mobile), 18px (desktop) for item icons.
- Color: inherit text color; muted on inactive; primary on active.
- Motion: 150ms ease-in-out for hover/focus transitions; no bounce.

## Spacing & Layout

- Spacing scale (Tailwind): 4, 6, 8, 10, 12 for nav paddings.
- PrimaryNav height: 56px mobile, 64px desktop.
- SecondaryNav height: 44px mobile, 52px desktop.
- SideRail width: 280px desktop; collapses to drawer on mobile.
- Click targets: minimum 40×40px.

## States & Interactions

- Hover: slight background tint `var(--color-surface-muted)` and text color shift.
- Active: underline or 2px bottom indicator bar in brand primary.
- Focus: 2px outline in `--color-focus` with `focus-visible` only.
- Disabled: reduced opacity 60%; no pointer events.

## Accessibility

- Contrast ratios ≥ 4.5:1 for text; ≥ 3:1 for large text.
- Keyboard navigable menus; skip-to-content link hidden until focused.
- Reduced motion support: respect `prefers-reduced-motion`.

## Examples (Tailwind / CSS)

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #14b8a6;
  --color-accent: #f59e0b;
  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-text: #0f172a;
  --color-text-muted: #475569;
  --color-border: #e2e8f0;
  --color-focus: #93c5fd;
}
.nav-item {
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}
.nav-item:hover {
  background: var(--color-surface-muted);
}
.nav-item[aria-current='page'] {
  border-bottom: 2px solid var(--color-primary);
}
.nav-focus:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```
