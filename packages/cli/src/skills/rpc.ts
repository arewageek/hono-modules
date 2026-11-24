export const rpcSkill = {
  name: 'hono-modules-rpc',
  content: `---
name: hono-modules-rpc
description: >-
  End-to-end Hono RPC type inference and typed Env bindings guide for
  hono-modules projects. Use when implementing chained routes, typing
  Cloudflare Workers/Bun/Node Env bindings, exporting AppType, consuming APIs
  with hc<AppType>, or debugging broken RPC types.
---

# hono-modules RPC & Environment Bindings

Preserving Hono's end-to-end TypeScript RPC inference (\`hc<AppType>\`) is the central guarantee of \`hono-modules\`. Every step in the chain must preserve inferred route schemas.

## 1. The Type Inference Chain

Types flow strictly through return values from each layer to the next:

\`\`\`text
routes.ts (chained Hono methods)
  -> module.ts (createModule<Env, typeof routes> preserves T)
    -> <modulesDir>/index.ts (registerModules returns app.route(...).route(...))
      -> app.ts (const routes = registerModules(app); export type AppType = typeof routes;)
        -> client (hc<AppType>(baseUrl))
\`\`\`

If **any** step discards a chained return value, downstream RPC inference collapses to an empty schema.

## 2. Always Chain Routes in \`routes.ts\`

TypeScript does not mutate a variable's type when calling \`.get()\` as a standalone statement. Always chain route methods directly onto the exported \`new Hono()\` expression.

**Wrong (breaks RPC inference):**
\`\`\`typescript
// Note: the default CLI template starts unchained — convert it to a chain!
export const usersRoutes = new Hono();

usersRoutes.get('/', (c) => {
  return c.json({ users: [] });
});
\`\`\`

**Correct (preserves full RPC schema):**
\`\`\`typescript
export const usersRoutes = new Hono()
  .get('/', (c) => {
    return c.json({ users: [] });
  })
  .get('/:id', (c) => {
    return c.json({ id: c.req.param('id') });
  });
\`\`\`

## 3. Export \`typeof routes\`, Never \`typeof app\`

In \`src/app.ts\`, capture the return value of \`registerModules(app)\` and export its type:

\`\`\`typescript
import { Hono } from 'hono';
import { registerModules } from './modules';

const app = new Hono();
const routes = registerModules(app);

export type AppType = typeof routes; // Correct: includes all chained module routes
export default app;
\`\`\`

Exporting \`typeof app\` omits every module registered inside \`registerModules\`.

## 4. Typed \`Env\` Bindings & Variables

For Cloudflare Workers (\`D1Database\`, \`KVNamespace\`, secrets) or typed context variables, define a shared \`AppEnv\` type and pass it consistently across \`routes.ts\`, \`module.ts\`, and \`app.ts\`:

\`\`\`typescript
// src/types/env.ts
export type AppEnv = {
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    userId: string;
  };
};
\`\`\`

**\`routes.ts\`:**
\`\`\`typescript
import { Hono } from 'hono';
import type { AppEnv } from '../../types/env';

export const usersRoutes = new Hono<AppEnv>().get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT id, name FROM users').all();
  return c.json({ users: result.results });
});
\`\`\`

**\`module.ts\`:**
\`\`\`typescript
import { createModule } from '@hono-modules/core';
import type { AppEnv } from '../../types/env';
import { usersRoutes } from './routes';

export const usersModule = createModule<AppEnv, typeof usersRoutes>({
  name: 'users',
  basePath: '/users',
  enabled: true,
  routes: usersRoutes,
});
\`\`\`

**\`app.ts\`:**
\`\`\`typescript
import { Hono } from 'hono';
import type { AppEnv } from './types/env';
import { registerModules } from './modules';

const app = new Hono<AppEnv>();
const routes = registerModules(app);

export type AppType = typeof routes;
export default app;
\`\`\`

## 5. Chained Validators for Typed RPC Inputs

Chain Hono validators (such as \`validator\` or \`@hono/zod-validator\`) inline inside the route method so \`hc<AppType>\` infers typed request payloads:

\`\`\`typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
});

export const usersRoutes = new Hono().post(
  '/',
  zValidator('json', createUserSchema),
  (c) => {
    const body = c.req.valid('json');
    return c.json({ created: body.email }, 201);
  }
);
\`\`\`

## 6. Consuming \`AppType\` with Hono Client

\`\`\`typescript
import { hc } from 'hono/client';
import type { AppType } from '../server/src/app';

const client = hc<AppType>('http://localhost:3000');

const res = await client.users.$get();
const data = await res.json();
\`\`\`

## 7. Troubleshooting Broken RPC Types

- **Client shows no routes or \`never\`**: Check \`routes.ts\` for unchained \`fooRoutes.get(...)\` statements, and confirm \`app.ts\` exports \`typeof routes\` (not \`typeof app\`).
- **One module is missing from \`AppType\`**: Verify \`<modulesDir>/index.ts\` chains \`.route('/<name>', <name>Module.routes)\` directly inside the \`return\` statement of \`registerModules\`.
- **\`Env\` mismatch errors**: Ensure \`routes.ts\`, \`module.ts\`, and \`app.ts\` reference the exact same \`Env\` type.
- **Disabled module still typed on client**: Expected behavior—\`createModule\` keeps the \`T\` route type intact when \`enabled: false\` while serving HTTP \`503\` at runtime.
`,
};
