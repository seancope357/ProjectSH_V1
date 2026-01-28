# SequenceHUB Design System

This document outlines the unified design system for SequenceHUB, ensuring consistency across all pages.

## 1. Typography

We use a strictly limited font stack to maintain brand identity and performance.

### Primary Font: **Geist Sans** (via `next/font`)
*   **Usage**: UI copy, headings, body text, buttons.
*   **Variable**: `--font-geist-sans`
*   **Tailwind Class**: `font-sans`

### Monospace Font: **Geist Mono** (via `next/font`)
*   **Usage**: Code snippets, technical data, order IDs, timestamp logs.
*   **Variable**: `--font-geist-mono`
*   **Tailwind Class**: `font-mono`

### Display/Brand Font (Optional/Future)
*   *Currently using Geist Sans with tighter tracking for brand headers.*

---

## 2. Color Palette

Our palette is derived from the "xLights" aesthetic: dark, high-contrast, with vibrant neon accents.

### Core Neutrals (Slate)
Used for backgrounds, text, and borders.
*   `slate-50`: Page backgrounds (Light mode)
*   `slate-900`: Section backgrounds, Cards (Dark mode)
*   `slate-950`: Hero backgrounds (Dark mode)

### Brand Colors (Blue & Purple)
Used for primary actions, links, and gradients.
*   **Primary Blue**: `blue-600` (Light), `blue-500` (Dark)
*   **Accent Purple**: `purple-600` (Gradient stops)

### Semantic Colors
*   **Success**: `green-500` (Downloads, earnings)
*   **Warning**: `yellow-500` (Ratings, alerts)
*   **Error**: `red-500` (Destructive actions)

---

## 3. UI Components (Tailwind Classes)

### Buttons
*   **Primary**: `bg-blue-600 text-white hover:bg-blue-700 rounded-full font-bold transition-all shadow-md`
*   **Secondary**: `bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-full font-semibold transition-all`
*   **Ghost**: `text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors`

### Cards
*   **Standard**: `bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow`
*   **Dark**: `bg-slate-900 border border-slate-800 rounded-2xl`

### Inputs
*   **Standard**: `border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`

---

## 4. Spacing & Layout
*   **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
*   **Section Padding**: `py-12` or `py-20` for major sections.
*   **Grid Gaps**: `gap-6` or `gap-8` for standard grids.

---

## 5. Animation (CSS-only)
*   **Hover Lift**: `transition-transform duration-300 hover:-translate-y-1`
*   **Fade In**: `opacity-0 animate-in fade-in duration-500`
*   **Pulse**: `animate-pulse` (Loading states, glow effects)
