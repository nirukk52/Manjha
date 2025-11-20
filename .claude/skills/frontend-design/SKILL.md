---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Tech Stack & Architecture

**Current Stack:**
- **Framework**: Next.js 13.4+ with App Router (React 18.2+)
- **Styling**: Tailwind CSS 3.3+ with `tailwindcss-animate`
- **Components**: Radix UI primitives for accessible, unstyled components
- **Theming**: `next-themes` for dark mode support
- **Icons**: `lucide-react` for icon library
- **Utilities**: `clsx` + `tailwind-merge` (via `cn` utility) for conditional class names
- **Type Safety**: TypeScript

**Next.js App Router Best Practices:**
- Use **Server Components** by default (better performance, smaller bundle)
- Add `'use client'` directive ONLY when needed (state, effects, browser APIs, event handlers)
- Separate layouts from page logic using `layout.tsx` and `page.tsx`
- Use `useRouter`, `usePathname`, `useSearchParams` from `next/navigation` in client components
- Colocate components with routes when route-specific; use shared `/components` for reusable UI

## Recommended Libraries

Consider adding these libraries for enhanced functionality:

**Animation & Motion:**
- `framer-motion` - Declarative animations for React (preferred for complex interactions)
- `react-spring` - Spring-physics based animations (lightweight alternative)
- Already installed: `tailwindcss-animate` for CSS-only animations

**Forms & Validation:**
- `react-hook-form` - Performant, flexible forms with easy validation
- `zod` - TypeScript-first schema validation (pairs excellently with react-hook-form)
- `@hookform/resolvers` - Validation resolvers for various schema libraries

**Advanced UI Components:**
- Radix UI primitives (already installed) - Continue using for accessible base components
- `cmdk` - Fast, composable command palette for React
- `vaul` - Drawer component for mobile-first interfaces
- `sonner` - Elegant toast notifications

**State Management (when needed):**
- `zustand` - Minimal, unopinionated state management (prefer over Redux for simplicity)
- `jotai` - Atomic state management (great for complex state scenarios)
- React Context + hooks (built-in, sufficient for most use cases)

**Performance & Developer Experience:**
- `@tanstack/react-query` - Data fetching, caching, and synchronization
- `usehooks-ts` - Collection of useful React hooks
- `react-use` - Alternative comprehensive hook collection

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. **Current project uses Inter (generic!) - REPLACE with distinctive choices** like:
  - Display fonts: DM Serif Display, Playfair Display, Cormorant Garamond, Syne, Archivo Black
  - Body fonts: Outfit, Plus Jakarta Sans, Manrope, Work Sans, Public Sans, Poppins
  - Monospace: JetBrains Mono (already in project), Fira Code, IBM Plex Mono
  - Use `next/font/google` for automatic font optimization
  - Pair a distinctive display font with a refined body font

- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables (already configured via Tailwind + globals.css). Dominant colors with sharp accents outperform timid, evenly-distributed palettes. The current theme system supports dark mode via `next-themes` - leverage this creatively.

- **Motion**: Use animations for effects and micro-interactions:
  - CSS-only: Use `tailwindcss-animate` for simple transitions
  - Complex interactions: Consider adding `framer-motion` for orchestrated animations
  - Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions
  - Use scroll-triggering and hover states that surprise

- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density. Break out of the container when appropriate for visual impact.

- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

**Component Architecture (shadcn/ui pattern):**
- Build components using Radix UI primitives + Tailwind styling
- Use `class-variance-authority` (CVA) for component variants
- Implement the `cn()` utility for conditional class merging
- Keep components in `/components/ui` for base components
- Create feature-specific components in `/components` or colocated with routes

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

**Accessibility & Performance:**
- Leverage Radix UI's built-in accessibility features
- Test keyboard navigation and screen reader compatibility
- Use Next.js Image component for optimized images
- Implement proper semantic HTML
- Ensure WCAG 2.1 AA compliance minimum

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
