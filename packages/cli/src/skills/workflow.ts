export const workflowSkill = {
  name: 'hono-modules-workflow',
  content: `---
name: hono-modules-workflow
description: >-
  Step-by-step runbook for initializing, scaffolding, implementing, extending,
  and toggling modules with @hono-modules/cli. Use whenever creating a new
  module, adding routes/services, enabling/disabling a feature, or wiring
  registerModules into a Hono app.
---

# hono-modules Implementation Workflow

Follow these exact procedures when implementing features in a \`hono-modules\` project.

## 0. Pre-Flight Check

Before creating or editing modules:

1. Read \`hm.config.json\` in the project root to identify the configured \`directory\` (for example, \`src/modules\`). If \`hm.config.json\` does not exist, initialize first with \`npx hm init\`.
2. Confirm \`<directory>/index.ts\` exports \`registerModules\`.
3. Confirm the main application entry file (typically \`src/app.ts\`) mounts the registry and exports \`AppType\`:

\`\`\`typescript
import { Hono } from 'hono';
import { registerModules } from './modules'; // Adjust path to match hm.config.json

const app = new Hono();
const routes = registerModules(app);

export type AppType = typeof routes;
export default app;
\`\`\`

## 1. Create a New Feature Module

Always use the CLI rather than creating module directories and editing \`index.ts\` by hand.

### Step 1: Pick a Valid Identifier Name

Use a valid camelCase JavaScript identifier for \`<name>\` (e.g., \`users\`, \`billing\`, \`orderItems\`). Avoid hyphens like \`user-profile\` because the CLI interpolates \`<name>\` directly into identifiers (\`<name>Module\`, \`<name>Routes\`, \`<name>Service\`).

### Step 2: Run the Generator

\`\`\`bash
npx hm generate module <name>
# Short alias:
npx hm g m <name>
\`\`\`

This automatically:
- Scaffolds \`<directory>/<name>/{module.ts,routes.ts,service.ts,types.ts}\`.
- Updates \`<directory>/index.ts\` via AST to import \`<name>Module\` and append \`.route('/<name>', <name>Module.routes)\` to \`registerModules\`.

### Step 3: Implement Files in Order

1. **\`types.ts\`**: Define DTOs, request payloads, and domain interfaces.
2. **\`service.ts\`**: Implement business logic methods on \`<Name>Service\` and export the singleton instance.
3. **\`routes.ts\`**: Replace the starter route with **chained** method calls on \`new Hono()\` so RPC types are preserved (see the \`hono-modules-rpc\` skill):
   \`\`\`typescript
   import { Hono } from 'hono';
   import { usersService } from './service';

   export const usersRoutes = new Hono()
     .get('/', async (c) => {
       const users = await usersService.list();
       return c.json({ users });
     })
     .get('/:id', async (c) => {
       const user = await usersService.findById(c.req.param('id'));
       if (!user) return c.json({ error: 'Not found' }, 404);
       return c.json({ user });
     });
   \`\`\`
   Remove unused imports if a starter file imports \`<name>Service\` without using it.
4. **\`module.ts\`**: Review \`createModule\` options (\`name\`, \`basePath\`, \`enabled\`, and \`Env\` generics if the project uses typed bindings).

### Step 4: Verify Registry & Types

- Inspect \`<directory>/index.ts\` to confirm \`<name>Module\` is imported and chained inside \`registerModules\`.
- Run the project's TypeScript typecheck (e.g., \`npx tsc --noEmit\`) to confirm zero compilation or RPC type errors.

## 2. Extend an Existing Module (Routes & Services)

> **CLI Status Note:** \`hm generate route\` and \`hm generate service\` are not yet implemented in \`@hono-modules/cli\`. Do not invoke them.

- **Add endpoints**: Append chained \`.get()\`, \`.post()\`, \`.put()\`, \`.patch()\`, or \`.delete()\` handlers directly onto the exported \`<name>Routes\` chain in \`<directory>/<name>/routes.ts\`.
- **Add business logic**: Add methods to \`<directory>/<name>/service.ts\`, or split complex logic into additional helper files inside \`<directory>/<name>/\` and call them from \`service.ts\`.
- **Add types**: Update \`<directory>/<name>/types.ts\`.

## 3. Enable or Disable a Module

> **CLI Status Note:** \`hm enable\` and \`hm disable\` are not yet implemented in \`@hono-modules/cli\`. Do not invoke them.

Edit \`<directory>/<name>/module.ts\` directly:

\`\`\`typescript
export const usersModule = createModule({
  name: 'users',
  basePath: '/users',
  enabled: false, // Returns HTTP 503 for all routes in this module
  routes: usersRoutes,
});
\`\`\`

Set \`enabled: true\` (or omit it) to re-enable the module.

## 4. Custom Mount Paths

The CLI AST updater mounts modules in \`<directory>/index.ts\` using the literal path \`'/<name>'\` (\`.route('/<name>', <name>Module.routes)\`). Changing \`basePath\` in \`module.ts\` alone does not change the mounted URL path unless you also update the path string in \`<directory>/index.ts\`.

## 5. Final Verification Checklist

- [ ] \`hm.config.json\` directory matches where the module was created.
- [ ] All routes in \`routes.ts\` are chained onto the exported \`Hono\` instance.
- [ ] \`<directory>/index.ts\` contains a single, non-duplicated \`.route()\` entry for the module inside \`registerModules\`.
- [ ] TypeScript typecheck (\`tsc --noEmit\`) passes cleanly.
`,
};
