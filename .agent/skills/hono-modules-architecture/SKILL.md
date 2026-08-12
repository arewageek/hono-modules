---
name: hono-modules-architecture
description: Guide for developing and maintaining Hono applications using the @hono-modules architecture. Explains the CLI, module chaining, RPC support, and feature toggles.
---

# hono-modules Architecture Guide

This project uses `@hono-modules/core` and `@hono-modules/cli` to structure a scalable Hono application. You must strictly follow these architectural rules when modifying or generating code for this codebase.

## Core Concepts

1.  **RPC Type Inference is King**: The primary goal of `hono-modules` is to preserve Hono's end-to-end RPC type safety. To do this, routes MUST be physically chained (`app.route().route()`) rather than added dynamically in loops.
2.  **No Manual Wiring**: Modules are automatically wired into the central registry (`index.ts`) by the CLI's AST manipulation. **DO NOT** manually import and register new modules in `index.ts`.
3.  **Feature Toggles**: Modules can be disabled dynamically via `enabled: false` in their `module.ts`. The core library intercepts these at runtime using a wrapper router that returns a `503 Service Unavailable` JSON response, without breaking the TypeScript RPC chain.

## Directory Structure

A standard `hono-modules` implementation looks like this:
```text
src/
├── app.ts                  # Main app instantiation
└── modules/                # The module registry (name may vary based on hm.config.json)
    ├── index.ts            # Central route chain (Auto-managed by CLI)
    ├── users/              # Example feature module
    │   ├── module.ts       # Exposes `createModule` config
    │   ├── routes.ts       # Hono route definitions
    │   ├── service.ts      # Domain logic
    │   └── types.ts        # Interfaces
```

## CLI Usage (Mandatory for Code Generation)

When asked to create a new module in a project using `hono-modules`, you **MUST** use the CLI. Do not manually create the folders or update the registry.

```bash
# Generate a new feature module
npx hm generate module <module-name>
```

This command will:
1.  Scaffold the module folder and files.
2.  Use AST manipulation to automatically append `.route('/<module-name>', <module-name>Module.routes)` to the `registerModules` function in `index.ts`.

## Environment Bindings

When creating or modifying modules in strict environments (like Cloudflare Workers), always pass the `Env` generic to `createModule`:

```typescript
import { createModule } from '@hono-modules/core';
import type { Env } from 'hono';

type MyEnv = { Bindings: { DB: D1Database } };

export const exampleModule = createModule<MyEnv, typeof exampleRoutes>({
  name: 'example',
  basePath: '/example',
  enabled: true,
  routes: exampleRoutes
});
```

## AI Agent Rules
1.  **NEVER** manually edit the central `index.ts` to register a module. Always use the `npx hm generate module` CLI command.
2.  **NEVER** use dynamic arrays or `ModuleRegistry` classes to group routes, as this breaks Hono RPC type inference.
3.  Always import from `@hono-modules/core` for runtime utilities.
