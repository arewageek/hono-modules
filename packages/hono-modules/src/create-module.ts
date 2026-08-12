import { Hono } from 'hono';
import type { Env } from 'hono';

export interface ModuleOptions<E extends Env = any, T extends Hono<E, any, any> = Hono<E, any, any>> {
  /**
   * The name of the module.
   */
  name: string;
  
  /**
   * The base path to mount this module's routes on.
   * If not provided, defaults to `/${name}`.
   */
  basePath?: string;
  
  /**
   * Whether the module is enabled.
   * If false, the module will intercept requests and return a 503 response.
   * @default true
   */
  enabled?: boolean;
  
  /**
   * The Hono router instance containing the module's endpoints.
   */
  routes: T;
}

/**
 * Creates a feature module definition.
 */
export function createModule<E extends Env = any, T extends Hono<E, any, any> = Hono<E, any, any>>(options: ModuleOptions<E, T>): ModuleOptions<E, T> {
  const isEnabled = options.enabled ?? true;
  let finalRoutes = options.routes;

  if (!isEnabled) {
    const wrapper = new Hono<E>();
    
    wrapper.use('*', async (c) => 
      c.json({ error: `The '${options.name}' feature is currently disabled.` }, 503)
    );
    
    wrapper.route('/', options.routes);
    
    finalRoutes = wrapper as unknown as T;
  }

  return {
    ...options,
    enabled: isEnabled,
    routes: finalRoutes,
  };
}
