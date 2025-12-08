# UI/UX Implementation Plan for thorium-web

## Objective

Implement the UI/UX design system from the reference project (`nicolebarlow_website_v2`) into the thorium-web subdomain project, following the comprehensive guide in `UI_UX_REPLICATION_PROMPT.md`.

## Current State

### Reference Project (nicolebarlow_website_v2)

- **Framework:** Next.js 15.5.0 with React 19.1.0
- **Styling:** Tailwind CSS v4 with PostCSS
- **Navigation:** Floating UI pattern (logo top-left, menu button top-right)
- **Fonts:** Poppins, Roboto, Roboto Mono, Mrs Saint Delafield, Zuume Rough Bold
- **Color Scheme:** Cyan accent (#06b6d4) with white/black base

### Current Project (thorium-web)

- **Framework:** Next.js 15.5.5 with React 19.2.0
- **Styling:** Basic CSS with CSS variables (no Tailwind)
- **Navigation:** None (basic header in home page)
- **Fonts:** Inter (single font)
- **Language:** TypeScript (reference is JavaScript)
- **Structure:** eReader application with publication grid

## Implementation Steps

### Phase 1: Setup and Configuration

#### 1.1 Install Tailwind CSS v4

- Install `tailwindcss@^4` and `@tailwindcss/postcss@^4`
- Create `postcss.config.mjs` with Tailwind plugin
- Update `src/app/app.css` to import Tailwind (`@import "tailwindcss"`)

#### 1.2 Configure Fonts

- Update `src/app/layout.tsx` to include:
  - Poppins (headings)
  - Roboto (body, navigation, buttons)
  - Roboto Mono (monospace)
  - Mrs Saint Delafield (H1 emphasis)
- Set up font variables matching reference project
- Apply font families via CSS layers in global styles

#### 1.3 Setup CSS Variables

- Add color palette CSS variables to global styles:
  - `--primary-cyan: #06b6d4`
  - `--secondary-cyan: #0891b2`
  - `--dark-cyan: #0e7490`
  - Grays and base colors
- Add custom animations (pulse-cyan keyframes)

### Phase 2: Navigation Component

#### 2.1 Create Navigation Component

- Create `src/components/Navigation.tsx` (convert from JS to TS)
- Implement floating logo (top-left, fixed position)
- Implement menu toggle button (top-right, circular with cyan ring)
- Add scroll detection (direction, position)
- Implement full-screen overlay menu

#### 2.2 Navigation Features

- Navigation items array with TypeScript types (title, href, excerpt)
- Smooth scroll functionality (ease-out cubic, 650ms)
- Menu open/close transitions (300ms)
- Pulse animation on menu button (3 pulses on load)
- Logo scroll behavior (fade/translate on scroll and menu open)

#### 2.3 Z-Index Layering

- Logo: `z-50`
- Menu button: `z-50`
- Menu overlay: `z-40`
- Menu card: `z-50` (within overlay)
- Scroll-to-top: `z-50`

### Phase 3: Scroll-to-Top Component

#### 3.1 Create ScrollToTop Component

- Create `src/components/ScrollToTop.tsx`
- Implement visibility detection (appears after 240px scroll)
- Add smooth scroll-to-top (ease-out cubic, 600ms)
- Style with cyan background, white icon, rounded-full
- Position: fixed `left-4 bottom-4`

### Phase 4: Layout Integration

#### 4.1 Update Root Layout

- Integrate Navigation component into `src/app/layout.tsx`
- Add ScrollToTop component
- Ensure font variables are applied to body
- Maintain existing providers (ThStoreProvider, ThPreferencesProvider, ThI18nProvider)

#### 4.2 Update Home Page

- Integrate Navigation into `src/app/page.tsx`
- Ensure proper component structure
- Maintain existing PublicationGrid functionality
- Add wrapper div with `relative` class if needed

### Phase 5: Styling and Responsive Design

#### 5.1 Global Styles

- Update `src/app/app.css` with:
  - Tailwind import
  - CSS variables
  - Custom animations
  - Font family assignments via CSS layers
  - Dark mode media query (if needed)

#### 5.2 Responsive Patterns

- Implement mobile-first approach
- Use Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px)
- Ensure navigation works on all screen sizes
- Test menu overlay on mobile devices

### Phase 6: Customization for Subdomain

#### 6.1 Navigation Items

- Configure navigation items for books/publications context:
  - Home
  - Books/Publications
  - About (if applicable)
  - Contact (if applicable)
- Update hrefs to match subdomain routes

#### 6.2 Logo

- Replace logo path with appropriate logo for books subdomain
- Ensure logo SVG/PNG is in `public/` directory
- Maintain same styling (h-24 w-auto, white background with blur)

#### 6.3 Color Scheme

- Keep cyan accent colors for consistency
- Maintain white/black base
- Ensure colors work with existing eReader components

### Phase 7: Testing and Refinement

#### 7.1 Functionality Testing

- Test navigation menu open/close
- Test smooth scrolling to sections
- Test scroll-to-top button
- Test responsive behavior on mobile/tablet/desktop
- Test keyboard navigation

#### 7.2 Visual Consistency

- Verify spacing matches reference (padding, gaps, margins)
- Verify typography matches reference
- Verify color usage matches reference
- Verify animations match reference

#### 7.3 Integration Testing

- Ensure Navigation doesn't interfere with eReader functionality
- Ensure z-index doesn't conflict with reader components
- Test with existing PublicationGrid
- Test with reader pages

## Key Files to Create/Modify

### New Files

1. `src/components/Navigation.tsx` - Main navigation component
2. `src/components/ScrollToTop.tsx` - Scroll-to-top button
3. `postcss.config.mjs` - PostCSS configuration for Tailwind

### Modified Files

1. `src/app/layout.tsx` - Add fonts, Navigation, ScrollToTop
2. `src/app/app.css` - Add Tailwind import, CSS variables, animations
3. `src/app/page.tsx` - Integrate Navigation
4. `package.json` - Add Tailwind CSS dependencies

## TypeScript Considerations

### Type Definitions Needed

- Navigation item type: `{ title: string; href: string; excerpt: string }`
- Scroll direction type: `'up' | 'down'`
- Component props types
- State types for hooks

### Conversion Notes

- Convert JavaScript to TypeScript
- Add proper type annotations
- Use React.FC or function component syntax
- Type event handlers properly

## Dependencies to Add

```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4"
}
```

## Implementation Checklist

### Setup

- [ ] Install Tailwind CSS v4 and PostCSS plugin
- [ ] Create postcss.config.mjs
- [ ] Update app.css with Tailwind import
- [ ] Add CSS variables for color palette
- [ ] Add custom animations (pulse-cyan)

### Fonts

- [ ] Install/configure Poppins font
- [ ] Install/configure Roboto font
- [ ] Install/configure Roboto Mono font
- [ ] Install/configure Mrs Saint Delafield font
- [ ] Update layout.tsx with font variables
- [ ] Add font family CSS rules

### Navigation

- [ ] Create Navigation.tsx component
- [ ] Implement floating logo
- [ ] Implement menu toggle button
- [ ] Implement full-screen overlay menu
- [ ] Add smooth scroll functionality
- [ ] Add scroll detection
- [ ] Add pulse animation
- [ ] Configure navigation items array

### Scroll-to-Top

- [ ] Create ScrollToTop.tsx component
- [ ] Implement visibility detection
- [ ] Implement smooth scroll-to-top
- [ ] Style with cyan background

### Integration

- [ ] Add Navigation to layout.tsx
- [ ] Add ScrollToTop to layout.tsx
- [ ] Update home page structure
- [ ] Test z-index layering
- [ ] Test responsive behavior

### Customization

- [ ] Configure navigation items for books context
- [ ] Add appropriate logo
- [ ] Verify color consistency
- [ ] Test with existing components

## Success Criteria

1. Navigation matches reference design (floating logo + menu button)
2. Full-screen overlay menu works correctly
3. Smooth scrolling functions properly
4. Scroll-to-top button appears and works
5. Typography matches reference (Poppins headings, Roboto body)
6. Colors match reference (cyan accents)
7. Responsive design works on all screen sizes
8. No conflicts with existing eReader functionality
9. TypeScript types are properly defined
10. Code follows project conventions