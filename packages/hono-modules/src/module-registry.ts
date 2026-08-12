import type { Hono, Env, Context } from 'hono';
import type { ModuleOptions } from './create-module';

export class ModuleRegistry<E extends Env = any> {
  private modules: ModuleOptions<E>[] = [];

  constructor() { }

  /**
   * Registers one or more modules.
   * @param modules An array of modules created via `createModule`.
   */
  public register(modules: ModuleOptions<E>[]) {
    this.modules.push(...modules);
  }

  /**
   * Applies all registered modules to the given Hono application instance.
   * @param app The main Hono application instance.
   */
  public applyTo(app: Hono<E, any, any>) {
    for (const mod of this.modules) {
      const basePath = mod.basePath ?? `/${mod.name}`;

      if (mod.enabled === false) {
        // Automatically handle requests to disabled modules
        const disabledResponse = (c: Context<E>) =>
          c.json({ error: `The '${mod.name}' feature is currently disabled.` }, 503);

        app.all(`${basePath}/*`, disabledResponse);
        app.all(basePath, disabledResponse);
        continue;
      }

      // Mount the module routes onto the app
      app.route(basePath, mod.routes);
    }
  }
}
