# AI Developer Memory & Context (Global)

This document captures universal architectural rules and paradigms. Information is grouped into discrete topics to ensure efficient lookup.

## MEMORY ORGANIZATION
> Rules for how this system should be maintained.

### Tiers & Capture
- **GLOBAL vs PROJECT**: Universal rules go here. Project-specific rules go to `project.md`.
- **AUTO-CAPTURE**: Always document "Always/Never/Must" rules immediately into the correct topic section.
- **CLEANLINESS**: Keep all system context in the `.brain/` directory.

## ARCHITECTURE & DATA FETCHING
> Core principles for building scalable and performant applications.

### React Server Components & Client Boundaries
- **RULE**: Push `"use client"` directives as far down the component tree as possible.
- **CONTEXT**: Maximizes server rendering performance and reduces bundle size.
- **IMPLEMENTATION**: Keep pages/parent wrappers as Server Components. Abstract only interactive elements into discrete sub-components with `"use client"`.

### Data Mutation (Next.js)
- **RULE**: Use Server Actions (`"use server"`) for internal data mutations.
- **CONTEXT**: API Routes (`/api/...`) are strictly for 3rd-party external access.
- **IMPLEMENTATION**: Use Server Actions for forms and in-app interactions to preserve type safety and reduce boilerplate.

## STYLING & DESIGN SYSTEM
> Guidelines for visual consistency.

### Utility-First Standards
- **RULE**: Use standard design system tokens for all components.
- **CONTEXT**: Ensures visual harmony across the entire application.
- **IMPLEMENTATION**: Avoid ad-hoc values; rely on predefined CSS variables or framework-specific utilities.
