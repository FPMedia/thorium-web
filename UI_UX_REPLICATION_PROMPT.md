# UI/UX and Navigation Replication Guide

This document provides comprehensive instructions for replicating the UI/UX design and navigation system from the main site to a subdomain project. The new project will have access to this project's files for reference.

## Overview

The site uses a **minimalist, floating navigation system** with a full-screen overlay menu. The design emphasizes:
- Clean, modern aesthetics with cyan accent colors
- Smooth scroll animations and transitions
- Mobile-first responsive design
- Floating UI elements (logo, menu button, scroll-to-top)
- Full-screen overlay navigation menu

---

## 1. Navigation System

### 1.1 Navigation Structure

**Location:** `app/components/Navigation.js`

The navigation uses a **floating UI pattern** with no traditional top navbar (desktop navbar is hidden).

#### Navigation Items Configuration

```javascript
const navItems = [
  {
    title: 'Home',
    href: '/',
    excerpt: 'South Africa\'s only female conservative podcaster and independent journalist...'
  },
  {
    title: 'Podcast',
    href: '/#podcast',
    excerpt: 'The NicoleB Show - Fearless journalism and investigative excellence...'
  },
  {
    title: 'Articles',
    href: '/#articles',
    excerpt: 'Latest investigative articles and thought-provoking insights...'
  },
  {
    title: 'About',
    href: '/#about',
    excerpt: 'Environmental activist, journalist, and constitutional rights defender...'
  },
  {
    title: 'Support',
    href: '/#support',
    excerpt: 'Help keep independent journalism alive—learn how you can support or sponsor the show...'
  },
  {
    title: 'Contact',
    href: '/#contact',
    excerpt: 'Story tips, media inquiries, and collaboration opportunities...'
  }
];
```

**Key Features:**
- Each item has a `title`, `href`, and `excerpt` for the menu overlay
- Anchor links (starting with `/#`) trigger smooth scroll to page sections
- Regular links navigate to different pages

### 1.2 Floating Logo (Top Left)

**Position:** Fixed top-left corner

**Styling:**
- White background with backdrop blur (`bg-white backdrop-blur-sm`)
- Padding: `p-2`
- Logo image: `/nicole_barlow_logo_final.svg`
- Size: `h-24 w-auto` (96px height)
- Z-index: `z-50`

**Scroll Behavior:**
- On scroll down: Logo slightly translates and scales down on mobile, stays visible on desktop
- On menu open: Logo fades out and translates
- Uses smooth transitions: `transition-all duration-300`

### 1.3 Menu Toggle Button (Top Right)

**Position:** Fixed top-right corner

**Styling:**
- White background with backdrop blur (`bg-white/95 backdrop-blur-sm`)
- Circular button: `rounded-full`
- Size: `w-12 h-12 sm:w-14 sm:h-14` (48px mobile, 56px desktop)
- Cyan ring: `ring-2 ring-cyan-500`
- Shadow: `shadow-xl`
- Z-index: `z-50`

**Animations:**
- **Pulse on page load:** 3 pulses over 2.1 seconds with cyan glow
- Custom animation: `pulse-cyan` (defined in `globals.css`)
- Icon rotates 90° when menu is open

**Icon:**
- Hamburger menu (3 lines) when closed
- X (close) when open
- SVG with `strokeWidth="2"`

### 1.4 Full-Screen Menu Overlay

**Structure:**
- Full viewport overlay: `fixed inset-0 z-40`
- Backdrop: `bg-black/50 backdrop-blur-sm` (semi-transparent black with blur)
- Centered menu card: White rounded card with shadow

**Menu Card:**
- Background: `bg-white/98 backdrop-blur-sm`
- Border radius: `rounded-2xl`
- Shadow: `shadow-2xl`
- Max width: `max-w-2xl`
- Max height: `max-h-[80vh]` with `overflow-y-auto`
- Centered on screen

**Menu Items:**
- Each item displays:
  - **Title:** Bold, black, `text-lg sm:text-xl`
  - **Excerpt:** Gray, smaller text, `text-xs sm:text-sm text-gray-600`
- Hover state: `hover:text-cyan-600 hover:bg-gray-50`
- Border between items: `border-b border-gray-200`
- Padding: `px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6`

**Transitions:**
- Menu visibility: `transition-all duration-300`
- Opacity: `visible opacity-100` when open, `invisible opacity-0` when closed

### 1.5 Smooth Scroll Behavior

**Implementation:**
- Custom ease-out cubic function: `easeOutCubic(t) = 1 - (1-t)³`
- Duration: 650ms
- Uses `requestAnimationFrame` for smooth animation
- Handles both anchor links (`/#section`) and regular navigation

**Function:**
```javascript
const scrollToElementId = (elementId) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const startY = window.pageYOffset;
  const targetY = rect.top + window.pageYOffset;
  animateScroll(startY, targetY, 650);
};
```

### 1.6 Scroll Detection

**States Tracked:**
- `isScrolled`: Boolean (true when scrollY > 50)
- `scrollDirection`: 'up' | 'down'
- `lastScrollY`: Previous scroll position

**Behavior:**
- Logo visibility adjusts based on scroll direction
- Menu button remains visible at all times

---

## 2. Design System

### 2.1 Color Palette

**Primary Colors:**
- **Cyan (Primary):** `#06b6d4` (`--primary-cyan`)
- **Cyan (Secondary):** `#0891b2` (`--secondary-cyan`)
- **Cyan (Dark):** `#0e7490` (`--dark-cyan`)

**Grays:**
- **Light Grey:** `#f3f4f6` (`--light-grey`)
- **Medium Grey:** `#6b7280` (`--medium-grey`)
- **Dark Grey:** `#374151` (`--dark-grey`)

**Base:**
- **Background:** `#ffffff` (white)
- **Foreground:** `#000000` (black)

**Usage:**
- Cyan used for: Buttons, links, accents, focus states, scroll-to-top button
- White/Black: Primary text and backgrounds
- Grays: Secondary text, borders, subtle backgrounds

### 2.2 Typography

**Font Stack (from `app/layout.js`):**

1. **Poppins** - Headings (h1-h6)
   - Weights: 300, 700
   - Styles: normal, italic
   - Variable: `--font-poppins`

2. **Mrs Saint Delafield** - Emphasized text in H1 only
   - Weight: 400
   - Variable: `--font-mrs-saint-delafield`
   - Applied to: `h1 em`, `h1 i`

3. **Roboto** - Body text, navigation, buttons
   - Weights: 300, 400, 500, 700
   - Styles: normal, italic
   - Variable: `--font-roboto`

4. **Roboto Mono** - Monospace text
   - Weights: 300, 700
   - Variable: `--font-roboto-mono`

5. **Zuume Rough Bold** - Hero section headline (local font)
   - Location: `app/components/FONTSPRINGDEMO-ZuumeRoughBold.woff`
   - Applied only in HeroSection component

**Font Application (from `globals.css`):**
```css
/* Headers - Poppins */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-poppins), sans-serif !important;
}

/* Emphasized H1 - Mrs Saint Delafield */
h1 em, h1 i {
  font-family: var(--font-mrs-saint-delafield), cursive !important;
  font-style: normal !important;
}

/* Body - Roboto */
p, div, span, a, li, td, th {
  font-family: var(--font-roboto), sans-serif;
}

/* Navigation & Buttons - Roboto */
nav, button {
  font-family: var(--font-roboto), sans-serif;
}
```

### 2.3 Spacing & Layout

**Container Max Widths:**
- Standard: `max-w-6xl` or `max-w-7xl`
- Menu: `max-w-2xl`
- Contact form: `max-w-4xl`

**Padding:**
- Mobile: `px-4` (16px)
- Tablet: `sm:px-6` (24px)
- Desktop: `lg:px-8` (32px)

**Section Spacing:**
- Vertical: `py-16 sm:py-20 lg:py-24` or `py-32`

**Gaps:**
- Grid gaps: `gap-6` (24px) or `gap-8` (32px)
- Flex gaps: `gap-2 sm:gap-3` or `gap-6`

### 2.4 Responsive Breakpoints

**Tailwind Defaults:**
- `sm:` 640px and up
- `md:` 768px and up
- `lg:` 1024px and up
- `xl:` 1280px and up

**Common Patterns:**
- Mobile-first: Base styles for mobile, then `sm:`, `md:`, `lg:` overrides
- Text sizes: `text-base sm:text-lg lg:text-xl`
- Spacing: `py-8 sm:py-12 lg:py-16`

---

## 3. Component Structure

### 3.1 Page Layout (from `app/page.js`)

**Component Order:**
1. `Navigation` - Floating navigation
2. `HeroSection` - Full-screen hero with background image
3. `PodcastExcerpt` - Podcast section
4. `ArticlesExcerpt` - Articles section
5. `AboutExcerpt` - About section
6. `Support` - Support/membership section
7. `WatchExcerpt` - Watch section
8. `Features` - CTA section with background pattern
9. `ContactSection` - Contact form
10. `Footer` - Footer with social links

**Wrapper:**
- All wrapped in `<div className="relative">`
- Structured data components at top level

### 3.2 Hero Section

**Structure:**
- Full viewport height: `min-h-[90vh] sm:min-h-screen`
- Background image: Grayscale, full cover
- Middle text strip: Black semi-transparent overlay (`bg-black/60`)
- Large headline: Zuume Rough Bold font, centered
- Social icons: Bottom-right on desktop, centered on mobile
- Floating content blocks: Below hero (overlap on desktop with negative margin)

**Key Features:**
- Background image from `/hero-tree-background.webp`
- Text: "NO COMPROMISE." (or configurable)
- Subscribe section with social media icons
- Two-column content blocks below (cyan left, white right)

### 3.3 Scroll-to-Top Button

**Location:** `app/components/ScrollToTop.js`

**Behavior:**
- Appears when scrollY > 240px
- Fixed position: `left-4 bottom-4`
- Styling: Cyan background (`bg-cyan-500`), white icon, rounded-full
- Smooth scroll to top with ease-out cubic animation
- Z-index: `z-50`

**Styling:**
- Size: `h-12 w-12` (48px)
- Shadow: `shadow-lg`
- Hover: `hover:bg-cyan-600`

---

## 4. Interactive Behaviors

### 4.1 Menu Interactions

**Opening:**
- Click menu button → Full-screen overlay fades in
- Logo fades out and translates
- Menu card slides in from center

**Closing:**
- Click backdrop (dark overlay) → Menu closes
- Click menu item → Menu closes, navigates or scrolls
- Smooth transitions on all state changes

### 4.2 Scroll Behaviors

**Smooth Scrolling:**
- All anchor links use smooth scroll
- Custom easing function (ease-out cubic)
- 650ms duration

**Scroll-to-Top:**
- Button appears after 240px scroll
- Smooth scroll with same easing
- 600ms duration

### 4.3 Hover States

**Menu Items:**
- Text color: Black → Cyan (`hover:text-cyan-600`)
- Background: Transparent → Light gray (`hover:bg-gray-50`)

**Buttons:**
- Background: Cyan → Darker cyan (`hover:bg-cyan-600`)
- Scale: Some buttons scale up (`hover:scale-105`)

**Links:**
- Color transitions: `transition-colors duration-200`

### 4.4 Focus States

**Form Inputs:**
- Focus ring: `focus:ring-2 focus:ring-cyan-500`
- Border: `focus:border-transparent`

**Buttons:**
- Focus ring: `focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2`

---

## 5. Custom Animations

### 5.1 Pulse Animation (Menu Button)

**Location:** `app/globals.css`

```css
@keyframes pulse-cyan {
  0% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(6, 182, 212, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0);
    transform: scale(1);
  }
}
```

**Usage:**
- Applied to menu button on page load
- 3 pulses over 2.1 seconds
- Cyan glow effect

### 5.2 Transition Durations

- **Fast:** `duration-200` (200ms) - Hover states, color changes
- **Medium:** `duration-300` (300ms) - Menu visibility, logo transitions
- **Slow:** `duration-600` (600ms) - Scroll animations

---

## 6. Global Styles

### 6.1 CSS Variables (from `globals.css`)

```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary-cyan: #06b6d4;
  --secondary-cyan: #0891b2;
  --dark-cyan: #0e7490;
  --light-grey: #f3f4f6;
  --medium-grey: #6b7280;
  --dark-grey: #374151;
}
```

### 6.2 Dark Mode Support

**Media Query:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --foreground: #f3f4f6;
  }
}
```

**Note:** Currently defined but may not be fully implemented across all components.

---

## 7. Dependencies & Setup

### 7.1 Required Packages

**From `package.json`:**
- `next`: 15.5.0
- `react`: 19.1.0
- `react-dom`: 19.1.0
- `tailwindcss`: ^4
- `@tailwindcss/postcss`: ^4

### 7.2 Font Setup

**Google Fonts (from `app/layout.js`):**
- Geist, Geist Mono
- Poppins
- Mrs Saint Delafield
- Roboto Mono
- Roboto

**Local Font:**
- Zuume Rough Bold: `app/components/FONTSPRINGDEMO-ZuumeRoughBold.woff`

### 7.3 Tailwind Configuration

**PostCSS Config:** `postcss.config.mjs`
- Uses `@tailwindcss/postcss` plugin

**CSS Import:** `@import "tailwindcss";` in `globals.css`

---

## 8. Implementation Checklist

### 8.1 Navigation Components

- [ ] Create `Navigation.js` component with floating logo and menu button
- [ ] Implement full-screen menu overlay
- [ ] Add smooth scroll functionality for anchor links
- [ ] Implement scroll detection (direction, position)
- [ ] Add pulse animation to menu button on load
- [ ] Configure navigation items array with titles and excerpts

### 8.2 Styling

- [ ] Set up CSS variables for colors
- [ ] Configure font families in layout
- [ ] Import and configure Tailwind CSS
- [ ] Add custom animations (pulse-cyan)
- [ ] Set up responsive breakpoints

### 8.3 Components

- [ ] Create `ScrollToTop.js` component
- [ ] Implement smooth scroll-to-top functionality
- [ ] Add scroll visibility detection

### 8.4 Layout Structure

- [ ] Set up root layout with font variables
- [ ] Configure global styles
- [ ] Add component order in main page
- [ ] Ensure proper z-index layering

### 8.5 Interactive Features

- [ ] Menu open/close transitions
- [ ] Smooth scroll animations
- [ ] Hover states on interactive elements
- [ ] Focus states for accessibility
- [ ] Responsive menu behavior

---

## 9. Key Files to Reference

### Essential Files:
1. **`app/components/Navigation.js`** - Complete navigation implementation
2. **`app/globals.css`** - Global styles, variables, animations
3. **`app/layout.js`** - Font configuration, root layout
4. **`app/components/ScrollToTop.js`** - Scroll-to-top button
5. **`app/page.js`** - Page structure and component order

### Supporting Files:
- **`package.json`** - Dependencies
- **`postcss.config.mjs`** - Tailwind configuration
- **`app/components/HeroSection.js`** - Hero section example
- **`app/components/Footer.js`** - Footer example
- **`app/components/ContactSection.js`** - Form styling example

---

## 10. Customization Notes

### For Subdomain Project:

1. **Navigation Items:** Update `navItems` array in `Navigation.js` with subdomain-specific items
2. **Logo:** Replace logo image path (`/nicole_barlow_logo_final.svg`) with subdomain logo
3. **Colors:** Adjust CSS variables if different brand colors are needed
4. **Fonts:** Keep same font stack or customize as needed
5. **Content Sections:** Adapt section components to subdomain content
6. **Hero Section:** Customize hero background image and text

### Maintaining Consistency:

- Keep the same navigation pattern (floating logo + menu button)
- Maintain smooth scroll behavior
- Use consistent spacing and typography scales
- Preserve the minimalist aesthetic
- Keep responsive breakpoints consistent

---

## 11. Accessibility Considerations

### Current Implementation:

- **ARIA Labels:** Menu button has `aria-expanded` and `sr-only` text
- **Focus States:** Form inputs and buttons have visible focus rings
- **Semantic HTML:** Uses proper `<nav>`, `<header>`, `<section>` tags
- **Keyboard Navigation:** Menu items are keyboard accessible

### Recommendations:

- Ensure all interactive elements are keyboard accessible
- Maintain proper heading hierarchy
- Add skip-to-content link if needed
- Test with screen readers
- Ensure color contrast meets WCAG standards

---

## 12. Performance Notes

### Optimizations:

- **Font Loading:** Uses Next.js font optimization
- **Images:** Uses Next.js `Image` component
- **Animations:** Uses `requestAnimationFrame` for smooth scrolling
- **Scroll Listeners:** Uses `{ passive: true }` for better performance

### Best Practices:

- Lazy load images where appropriate
- Minimize JavaScript in navigation component
- Use CSS transitions over JavaScript animations where possible
- Optimize font loading with `display: 'swap'`

---

## Summary

The navigation system is a **floating UI pattern** with:
- **Top-left:** Floating logo that responds to scroll
- **Top-right:** Menu button with pulse animation
- **Full-screen overlay:** Centered menu card with navigation items
- **Smooth scrolling:** Custom ease-out cubic animation for anchor links
- **Scroll-to-top:** Floating button appears after scrolling

The design emphasizes **minimalism**, **smooth interactions**, and **mobile-first responsiveness** with a cyan accent color scheme.

