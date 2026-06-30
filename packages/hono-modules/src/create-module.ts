import type { Hono } from 'hono';

export interface ModuleOptions<T extends Hono = Hono> {
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
   * If false, the ModuleRegistry will intercept requests and return a 503 response.
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
export function createModule<T extends Hono>(options: ModuleOptions<T>): ModuleOptions<T> {
  return {
    ...options,
    enabled: options.enabled ?? true,
  };
}
