# hono-modules

A lightweight module and feature manager for HonoJS applications.

`hono-modules` provides a structured, scalable approach to developing Hono backends. By enforcing a feature-driven (modular) architecture, it helps maintain clean codebases in growing applications without the overhead of heavy frameworks, **while preserving 100% of Hono's RPC Type Inference**.

## Core Architecture

1. **Standardized Feature-First Directory Structure**: Organizes application logic by domain rather than technical role. The root directory name (e.g., `modules`, `features`, `api`) is fully customizable.
2. **Perfect RPC Type Safety**: The CLI automatically writes physical `.route()` chains into a central registry file. This means the Hono RPC Client can perfectly infer every endpoint across all of your modules with zero runtime overhead.
3. **Environment Bindings Support**: Fully typed for Cloudflare Workers, Node.js, and Bun. Pass your `Env` interface and get strict typings everywhere.
4. **Feature Toggles**: Effortlessly disable modules. Disabled modules automatically intercept traffic and return a `503 Service Unavailable` JSON response without breaking your TypeScript RPC chain.

---

## Installation

Install the runtime library as a production dependency:

```bash
npm install @hono-modules/core
```

Install the CLI as a development dependency:

```bash
npm install -D @hono-modules/cli
```

---

## Directory Structure

`hono-modules` enforces concise naming conventions within feature directories to minimize redundancy. The CLI configures the structure automatically. A standard application structure is as follows:

```text
src/
├── app.ts                  # Main Hono application instantiation
├── index.ts                # Server entry point
├── core/                   # Global middlewares, utilities, and error handlers
└── modules/                # Customizable folder name (e.g., 'features', 'api')
    ├── index.ts            # Central module chain (Auto-managed by CLI)
    ├── users/              # Example "users" feature module
    │   ├── module.ts       # Module definition and configuration
    │   ├── routes.ts       # Hono route definitions
    │   ├── service.ts      # Business logic implementation
    │   └── types.ts        # Type definitions and interfaces
    └── auth/               # Example "auth" feature module
        └── ...
```

---

## Usage Guide

### 1. Initialization

Initialize the library in your project root. The CLI will prompt you to define your preferred directory name (e.g., `src/modules` or `src/features`) and will generate a configuration file (`hm.config.json`) alongside the central registry.

```bash
npx hm init
```

### 2. Generate a Module

Use the CLI to scaffold a new feature. The CLI will generate the necessary files and **automatically chain the module's routes** in your central registry file. Manual configuration is not required.

```bash
npx hm generate module users
```

The generated `module.ts` supports programmatic feature flagging via the `enabled` property.

```typescript
// src/modules/users/module.ts
import { createModule } from '@hono-modules/core';
import { userRoutes } from './routes';

export const usersModule = createModule({
  name: 'users',
  basePath: '/users', // Automatically prefixes all routes in this module
  enabled: true,      // Set to false to disable this API domain and return 503s
  routes: userRoutes,
});
```

### 3. Apply to the Application

The only manual wiring required is to import the automatically generated `registerModules` function into your main application initialization file (e.g., `src/app.ts`), wrap your app in it, and export the type!

```typescript
import { Hono } from 'hono';
import { registerModules } from './modules'; // Path corresponds to your configured directory

const app = new Hono();

// Automatically mounts all your feature modules
const routes = registerModules(app);

// Perfect RPC Type Inference exported for your frontend!
export type AppType = typeof routes;

export default app;
```

---

## Advanced: Environment Bindings

If you are using environments that require strong typing (like Cloudflare Workers `Env`), `hono-modules` supports it natively:

```typescript
import type { Hono, Env } from 'hono';

type MyEnv = {
  Bindings: {
    DB: D1Database;
  }
}

// Pass your Env generic into createModule to strictly type your context
export const usersModule = createModule<MyEnv, typeof userRoutes>({
  name: 'users',
  routes: userRoutes
});
```

---

## CLI Reference

The `@hono-modules/cli` package provides commands for code generation and configuration management. The executable is accessible via `hm` or `hono-modules`.

### `hm init`
Initializes the `hono-modules` structure in an existing Hono application. Prompts for the preferred directory name, generates `hm.config.json`, and scaffolds the central registry.

### `hm generate module <name>` (Alias: `hm g m <name>`)
Scaffolds a new feature module directory. Generates the base files (`module.ts`, `routes.ts`, `service.ts`, `types.ts`) and automatically updates the central registry to physically chain the new module for RPC support.

### `hm generate route <module> <name>` (Alias: `hm g r <module> <name>`)
Appends a new route configuration to an existing module's route file. *(Not yet implemented)*

### `hm generate service <module> <name>` (Alias: `hm g s <module> <name>`)
Generates an additional service file for a specific module to handle extended domain logic. *(Not yet implemented)*

### `hm enable <module>` / `hm disable <module>`
Programmatically updates the `enabled` boolean property in the target module's `module.ts` configuration file. *(Not yet implemented)*

---

## License
MIT
