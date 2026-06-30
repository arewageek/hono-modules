# Vision: hono-modules

## Overview
`hono-modules` is a lightweight, opinionated node package designed to bring structure, scalability, and ease of development to HonoJS applications. By enforcing a feature-driven (modular) architecture, it prevents the typical "spaghetti code" that emerges in growing Express/Hono apps, without introducing the heavy overhead of full-blown frameworks like NestJS.

The core philosophy is **simplicity and cleanliness**. We want to provide a solid foundation without cluttering the user's application with irrelevant code or excessive "magic." Every detail, down to the file naming convention, should reflect this.

## Core Pillars

1. **Standardized File/Folder Structuring (Feature-First)**
2. **Module Registry & Route Discovery**
3. **Developer Experience (CLI Scaffolding)**

---

## 1. Directory Structure (Feature-First Architecture)

Instead of grouping files by technical role, `hono-modules` promotes grouping by feature/domain. To maintain maximum simplicity and avoid visual clutter, filenames inside a module are concise (e.g., `module.ts`, `routes.ts`) rather than repetitively prefixed with the module name.

A typical Hono app using `hono-modules` will look like this:

```text
src/
├── app.ts                  # Main Hono app instantiation
├── index.ts                # Entry point (Bun/Node server)
├── core/                   # Global middlewares, utilities, error handlers
└── modules/
    ├── index.ts            # Central module registry
    ├── users/              # The "users" module
    │   ├── module.ts       # Module definition and route registration
    │   ├── routes.ts       # Route definitions (Hono instance)
    │   ├── service.ts      # Business logic
    │   └── types.ts        # Interfaces and DTOs
    └── auth/               # The "auth" module
        └── ...
```

---

## 2. Module Registry & Route Discovery

To keep the main `app.ts` exceptionally clean, the module registry is handled in a separate file (e.g., `src/modules/index.ts`). This file configures the registry and exports it to be seamlessly applied to the Hono app instance.

### The `createModule` API

Modules can be dynamically enabled or disabled. This is incredibly useful for feature flagging or temporarily turning off an API domain. 

**Example: `src/modules/users/module.ts`**
```typescript
import { createModule } from 'hono-modules';
import { userRoutes } from './routes';

export const usersModule = createModule({
  name: 'users',
  basePath: '/users', // Optional: automatically prefixes all routes
  enabled: true,      // Toggles the module on/off
  routes: userRoutes,
});
```

### The `ModuleRegistry`

The registry manages module aggregation. If a registered module has `enabled: false`, the `ModuleRegistry` will automatically intercept any requests to that module's `basePath` and return a built-in fallback response (e.g., `404 Not Found` or `503 Service Unavailable` with a descriptive "Module Disabled" message). No manual configuration is required by the user to enable this protection.

**Example: `src/modules/index.ts`**
```typescript
import { ModuleRegistry } from 'hono-modules';
import { usersModule } from './users/module';
import { authModule } from './auth/module';

// The registry comes with built-in disabled module protection
export const registry = new ModuleRegistry();

registry.register([
  usersModule, 
  authModule
]);
```

**Example: `src/app.ts`**
```typescript
import { Hono } from 'hono';
import { registry } from './modules';

const app = new Hono();

// Applies all registered modules to the Hono instance
registry.applyTo(app);

export default app;
```

---

## 3. CLI (Command Line Interface)

The CLI is the engine of developer productivity. It will allow developers to quickly scaffold out the boilerplate for modules, controllers, services, etc.

**Command Prefix:** `npx hono-modules` or a shortened alias like `hm`.

### Proposed Commands:

*   **`hm init`**
    *   Initializes the project structure in an existing Hono app.
    *   Creates the `src/modules` folder and sets up the `src/modules/index.ts` registry.
*   **`hm generate module <name>`** (Alias: `hm g m <name>`)
    *   Creates a new folder under `src/modules/<name>`.
    *   Generates the base boilerplate: `module.ts`, `routes.ts`, `service.ts`, `types.ts`.
*   **`hm generate route <module> <name>`** (Alias: `hm g r <module> <name>`)
    *   Appends a new route definition to an existing module's route file.
*   **`hm generate service <module> <name>`** (Alias: `hm g s <module> <name>`)
    *   Creates an additional service file if the domain gets too large.
*   **`hm enable <module>` / `hm disable <module>`**
    *   Programmatically updates the `enabled` boolean in the `<module>/module.ts` file to toggle the feature on or off.

---

## 4. Implementation Strategy

To build this package, we will divide the work into two main packages/exports:

1.  **The Runtime Library (`hono-modules`)**:
    *   Exports `createModule`, `ModuleRegistry`.
    *   Zero dependencies (or minimal, relying only on `hono` as a peer dependency).
    *   Fully typed with TypeScript.
2.  **The CLI Tool (`hono-modules/cli` or a separate `create-hono-module` / `hono-modules-cli` bin)**:
    *   Built with tools like `commander` and `prompts` for a great interactive experience.
    *   Uses simple template strings or an AST modifier to generate, insert code, and toggle flags.

## 5. Design Principles
*   **No Magic:** Everything should be traceable. The CLI writes standard code; the runtime does simple wiring. No decorators or heavy reflection.
*   **Serverless First:** Designed to run seamlessly on Cloudflare Workers, Bun, Deno, and Node.js. Startup time must remain lightning fast.
*   **Type Safety:** 100% written in TypeScript with excellent generic inference.