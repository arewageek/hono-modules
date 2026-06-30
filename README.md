# hono-modules

A lightweight module and feature manager for HonoJS applications.

`hono-modules` provides a structured, scalable approach to developing Hono backends. By enforcing a feature-driven (modular) architecture, it helps maintain clean codebases in growing applications without the overhead of heavy frameworks.

## Core Architecture

1. **Standardized Feature-First Directory Structure**: Organizes application logic by domain rather than technical role. The root directory name (e.g., `modules`, `features`, `api`) is fully customizable.
2. **Explicit Module Registry**: Centralizes route aggregation to keep the main application entry point clean. Utilizes explicit array registration to maximize startup performance and avoid unpredictable filesystem-based auto-discovery.
3. **CLI-Driven Configuration**: The CLI automatically handles the wiring and registration of new modules. Developers only need to import the registry into their application entry point once.

---

## Installation

Install the runtime library via your preferred package manager:

```bash
npm install hono-modules
```
```bash
yarn add hono-modules
```
```bash
bun add hono-modules
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
    ├── index.ts            # Central module registry (Auto-managed by CLI)
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
hm init
```

### 2. Generate a Module

Use the CLI to scaffold a new feature. The CLI will generate the necessary files and **automatically register the module** in your central registry file. Manual configuration is not required.

```bash
hm generate module users
```

The generated `module.ts` supports programmatic feature flagging via the `enabled` property.

```typescript
// src/modules/users/module.ts
import { createModule } from 'hono-modules';
import { userRoutes } from './routes';

export const usersModule = createModule({
  name: 'users',
  basePath: '/users', // Automatically prefixes all routes in this module
  enabled: true,      // Set to false to disable this API domain
  routes: userRoutes,
});
```

### 3. Apply to the Application

The only manual wiring required is to import the registry into your main application initialization file (e.g., `src/app.ts`) and apply it to the Hono instance.

```typescript
import { Hono } from 'hono';
import { registry } from './modules'; // Path corresponds to your configured directory

const app = new Hono();

registry.applyTo(app);

export default app;
```

---

## CLI Reference

The `@hono-modules/cli` package provides commands for code generation and configuration management. The executable is accessible via `hm` or `hono-modules`.

### `hm init`
Initializes the `hono-modules` structure in an existing Hono application. Prompts for the preferred directory name, generates `hm.config.json`, and scaffolds the central registry.

### `hm generate module <name>` (Alias: `hm g m <name>`)
Scaffolds a new feature module directory. Generates the base files (`module.ts`, `routes.ts`, `service.ts`, `types.ts`) and automatically updates the central registry to include the new module.

### `hm generate route <module> <name>` (Alias: `hm g r <module> <name>`)
Appends a new route configuration to an existing module's route file.

### `hm generate service <module> <name>` (Alias: `hm g s <module> <name>`)
Generates an additional service file for a specific module to handle extended domain logic.

### `hm enable <module>` / `hm disable <module>`
Programmatically updates the `enabled` boolean property in the target module's `module.ts` configuration file.

---

## Design Principles

*   **Traceability**: Configurations and routings are explicit. The CLI writes standard, readable code, and the runtime executes explicit wiring without decorators or hidden filesystem dependencies.
*   **Automation over Magic**: The CLI automates the boilerplate and registry wiring, ensuring developers do not have to write repetitive configuration code, while keeping the output 100% transparent.
*   **Serverless Compatibility**: Designed for environments like Cloudflare Workers, Bun, Deno, and Node.js. The absence of filesystem auto-discovery ensures optimal cold-startup performance.
*   **Simplicity**: Enforces maintainable architectural patterns without complex abstractions.
*   **Type Safety**: Written entirely in TypeScript, leveraging generic inference to maintain end-to-end type safety.

---

## License
MIT
