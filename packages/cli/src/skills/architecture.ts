export const architectureSkill = {
  name: 'hono-modules-architecture',
  content: `---
name: hono-modules-architecture
description: >-
  Core architecture and design rules for projects built with @hono-modules/core
  and @hono-modules/cli. Use when reading, designing, reviewing, or modifying
  any module or application structure in a hono-modules codebase.
---

# hono-modules Architecture

This project uses \`@hono-modules/core\` and \`@hono-modules/cli\` to organize a Hono backend into isolated, feature-first modules while preserving 100% of Hono's end-to-end RPC type inference.

## 1. Always Check \`hm.config.json\` First

Never assume modules live in \`src/modules\`. Always read \`hm.config.json\` at the project root first:

\`\`\`json
{
  "directory": "src/modules"
}
\`\`\`

Use the \`directory\` value as the root path for all module files and the central registry \`index.ts\`.

## 2. Directory Structure

Every feature domain lives in its own folder with concise, standardized filenames:

\`\`\`text
src/
├── app.ts                  # Main Hono instance + registerModules(app) + export type AppType
└── <modulesDir>/           # Path defined in hm.config.json (e.g., src/modules)
    ├── index.ts            # Central .route() chain (auto-managed by CLI)
    └── <name>/             # Single feature module
        ├── module.ts       # Module config exported via createModule()
        ├── routes.ts       # Hono route handlers (thin HTTP transport layer)
        ├── service.ts      # Business/domain logic
        └── types.ts        # Interfaces and DTOs
\`\`\`

### Layer Responsibilities

- **\`module.ts\`**: Declares module metadata (\`name\`, \`basePath\`, \`enabled\`, \`routes\`) with \`createModule\` from \`@hono-modules/core\`.
- **\`routes.ts\`**: Defines HTTP routes, request validation, and JSON/HTTP responses. Delegates business logic to \`service.ts\`.
- **\`service.ts\`**: Contains domain logic and data operations. Keep HTTP framework concerns out of services whenever possible.
- **\`types.ts\`**: Defines module-scoped TypeScript interfaces and DTOs.
- **\`index.ts\`**: Exports \`registerModules(app)\`, physically chaining \`.route('/<name>', <name>Module.routes)\` calls.

## 3. Core Runtime API (\`@hono-modules/core\`)

\`@hono-modules/core\` exports \`createModule\` and \`ModuleOptions\`:

\`\`\`typescript
import { createModule } from '@hono-modules/core';
import { usersRoutes } from './routes';

export const usersModule = createModule({
  name: 'users',
  basePath: '/users',
  enabled: true, // Defaults to true
  routes: usersRoutes,
});
\`\`\`

### How Feature Toggles Work (\`enabled: false\`)

When \`enabled\` is set to \`false\`, \`createModule\` does not remove the module from the TypeScript route chain:

1. At runtime, it wraps \`routes\` in an internal \`Hono\` instance with a catch-all middleware (\`wrapper.use('*', ...)\`) that immediately returns HTTP \`503 Service Unavailable\`:
   \`\`\`json
   { "error": "The '<name>' feature is currently disabled." }
   \`\`\`
2. At compile time, it casts the wrapper back to the original \`routes\` type \`T\`, so frontend RPC types (\`AppType\`) stay intact without breaking builds.

## 4. Non-Negotiable Architectural Rules

1. **Preserve physical \`.route()\` chaining**: Never replace \`registerModules\` with dynamic loops, arrays, or a runtime \`ModuleRegistry\` class—dynamic mounting erases Hono's compile-time route schema.
2. **Do not manually wire new modules in \`index.ts\`**: Use \`npx hm generate module <name>\` so the CLI's AST updater imports and chains the module reliably.
3. **Keep \`registerModules\` return statement intact**: The CLI appends \`.route(...)\` calls to the first \`return\` expression inside \`registerModules\`. Do not rewrite \`registerModules\` into a non-returning function.
4. **Always import runtime utilities from \`@hono-modules/core\`**.
5. **Keep domains decoupled**: Avoid reaching across another module's internal files directly unless sharing explicit exported service/type contracts.
`,
};
