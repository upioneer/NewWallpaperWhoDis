# BRAND GUIDELINES

## LOGO & IDENTITY
* **Project Name:** New Wallpaper Who Dis
* **Primary Element:** Minimalist typography with a subtle background particle motif.
* **Favicon:** Geometric abstract shape or stylized 'W' matching the primary accent color.

## COLOR PALETTE (CSS Variables & Tailwind)
*We adopt a robust system that seamlessly transitions between Light and Dark modes.*

### Dark Mode (Default / Highly Recommended)
* **Base Background:** `#09090b` (Deep Zinc/Black) - Excellent for vibrant particle contrast.
* **Card/Panel Background:** `#18181b` (Zinc 900) - For elevated UI surfaces with slight transparency (glassmorphism).
* **Primary Accent:** `#3b82f6` (Blue 500) or `#8b5cf6` (Violet 500) - Used for buttons, active states, and particle highlights.
* **Primary Text:** `#f8fafc` (Slate 50)
* **Secondary/Muted Text:** `#a1a1aa` (Zinc 400)
* **Border/Subtle Divider:** `#27272a` (Zinc 800)

### Light Mode
* **Base Background:** `#ffffff` (White)
* **Card/Panel Background:** `#f4f4f5` (Zinc 100) - For elevated UI surfaces.
* **Primary Accent:** `#2563eb` (Blue 600) or `#7c3aed` (Violet 600)
* **Primary Text:** `#09090b` (Zinc 950)
* **Secondary/Muted Text:** `#52525b` (Zinc 600)
* **Border/Subtle Divider:** `#e4e4e7` (Zinc 200)

## TYPOGRAPHY
* **Header Font:** **Inter** (Google Fonts)
    * **Usage:** H1, H2, H3, and major calls to action. Clean, modern, highly legible.
    * **Weights:** Bold 700, ExtraBold 800
* **Body Font:** **Inter** (Google Fonts)
    * **Usage:** General paragraph text, small links, and UI elements.
    * **Weights:** Regular 400, Medium 500
* **Monospace Font:** **JetBrains Mono** or **Fira Code** (Google Fonts)
    * **Usage:** System paths, URL slugs, code snippets, and terminal-like outputs.

## UI / UX PRINCIPLES & COMPONENTS
* **Theme Preference:** System default, with a manual toggle in the UI. Dark mode is prioritized for aesthetics.
* **Border Radius:** Rounded edges (`rounded-lg` or `rounded-xl` in Tailwind) for a softer, modern feel.
* **Shadows & Elevation:** Soft, diffuse drop shadows. Glow effects on primary buttons in dark mode.
* **Buttons:** Solid primary backgrounds with subtle hover scale transformations (`hover:scale-105`) and transitioning background colors.
* **Surfaces:** Glassmorphism heavily utilized (translucent backgrounds with background blur) to allow the particle background to shine through.
* **Transitions & Animations:** Fluid background particles. Modals and pages slide/fade in gently (e.g., `duration-300 ease-out`).

## IMAGERY & BRAND VOICE
* **Brand Voice:** Minimalist, technical yet friendly. "Set it and forget it."
* **Key Terminology:** Use terms like "Slug" (instead of URL path), "Profile", "Rotation Engine", "Dashboard".
