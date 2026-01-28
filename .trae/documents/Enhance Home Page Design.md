I have analyzed the current landing page and developed a plan to transform it into a professional, engaging, and "fun" marketplace hub. Since `framer-motion` is not installed, I will utilize advanced Tailwind CSS techniques for high-performance animations.

# Enhance Home Page UX/UI

## 1. "Night Mode" Immersive Hero Section
*   **Concept**: xLights displays happen at night. The hero should reflect this canvas.
*   **Changes**:
    *   Switch background to a deep radial gradient (`slate-900` to `blue-950`).
    *   Add a CSS-based "Glow" animation behind the main headline to simulate lighting effects.
    *   Update the Search Bar to a "glassmorphism" style (translucent white) to pop against the dark background.
    *   **Fun Factor**: Subtle "twinkle" animation on background dots.

## 2. "Explore by Prop" Visual Categories
*   **Current**: Simple text links.
*   **New**: A 6-column grid of "Prop Cards".
    *   Each card features a large icon (e.g., Tree, House, Snowflake) and a vibrant background color.
    *   **Interaction**: Hovering scales the card up and makes the icon glow.

## 3. "App Store" Style Browsing
*   **Current**: Standard vertical grids.
*   **New**:
    *   **Trending Row**: A horizontal scroll-snap container. This feels tactile and modern (like Netflix or App Store).
    *   **Editors' Picks**: A featured "Spotlight" layout (one large featured item on the left, 4 smaller items on the right).

## 4. Professional Trust & Social Proof
*   **Live Stats Strip**: A slim, auto-scrolling ticker showing "Latest purchase: Wizards in Winter - 2m ago" (simulated or real if available) to create a sense of activity.
*   **Creator Spotlight**: A dedicated row highlighting a top seller with their avatar and a "Follow" button.

## 5. Technical Implementation
*   **File**: `src/components/ui/marketplace-home.tsx`
*   **Styling**: Use `group-hover`, `backdrop-blur`, and `transition-all` for smooth interactivity without heavy libraries.
*   **Performance**: Maintain Server Components data passing; keep all interactivity CSS-based for zero-layout-shift loading.
