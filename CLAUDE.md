# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Next.js + Turbopack) — runs on port 7001
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (eslint-config-next with core-web-vitals + typescript)
```

## Architecture

Single-page marketing site for **AAME (American Aesthetics Medical Education)**, a medical aesthetics training school. Next.js 16 App Router with React 19, Tailwind CSS 4, and framer-motion.

### Pages

- **Homepage** (`src/app/page.tsx`) — Main landing page (~950 lines, client component). Sections: Hero with GodRays shader → About AAME → Meet the Founder → Course Catalog (21 courses) → Professional Pathways → Location & Contact with Google Maps embed. Contains an expandable enrollment modal with MeshGradient background.
- **Schedule** (`src/app/schedule/page.tsx`) — Dynamic course schedule. Fetches from Supabase `course_schedule` table with automatic fallback to sample data when Supabase is not configured.
- **Courses** (`src/app/courses/page.tsx`) — Filterable course catalog grid. Shares the same 21-course dataset as the homepage.

### Shared Components

- `src/components/Navbar.tsx` — Fixed glass-morphism navbar with mobile hamburger menu
- `src/components/Footer.tsx` — 4-column footer with newsletter signup

### Data Layer

- `src/lib/supabase.ts` — Supabase client (exports `supabase` client or `null` if env vars missing, plus `supabaseConfigured` boolean). Defines `CourseSchedule` type.
- Environment variables in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Styling

- `src/app/globals.css` — Uses `@import "tailwindcss"` and `@theme inline { }` for custom tokens
- CSS variables: `--primary: #08d1ce`, `--primary-light: #00f2fe`, `--charcoal: #2c2c2c`, `--background: #fdfdfd`
- Custom classes: `.sparkle-btn` (gradient CTA), `.glass-nav` (backdrop blur), `.medical-grid` (dot pattern), `.geometric-block` (clip-path shapes)
- Fonts: Montserrat (display), Inter (body) — loaded via `<link>` tags in `layout.tsx`

## Key Conventions

- **Tailwind CSS 4**: No `tailwind.config` file. Custom tokens go in `@theme inline { }` inside `globals.css`. Use `@import "tailwindcss"` (not `@tailwind` directives).
- **Font loading**: Google Fonts and Material Symbols Outlined are loaded via `<link>` tags in `layout.tsx` `<head>`, NOT via `@import url()` in CSS (which breaks Tailwind CSS 4's requirement that `@import` must precede all rules).
- **Images**: Use `h-auto` + `style={{ width: "100%", height: "auto" }}` on Next.js `<Image>` to prevent clipping. Remote image domains configured in `next.config.ts`.
- **Animations**: framer-motion for scroll parallax, hover effects, and modal transitions. `@paper-design/shaders-react` for GodRays and MeshGradient visual effects.
- **Path alias**: `@/*` maps to `./src/*`
- **Brand colors**: Primary teal `#08d1ce`, light teal `#00f2fe`, charcoal `#2c2c2c`, white `#fdfdfd`
- **Owner**: Strani Mayorga (15+ years in medical aesthetics)
