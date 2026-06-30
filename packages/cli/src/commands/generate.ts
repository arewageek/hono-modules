import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../utils/config';
import { addModuleToRegistry } from '../utils/ast';

const MODULE_TEMPLATE = (name: string) => `import { createModule } from 'hono-modules';
import { ${name}Routes } from './routes';

export const ${name}Module = createModule({
  name: '${name}',
  basePath: '/${name}',
  enabled: true,
  routes: ${name}Routes,
});
`;

const ROUTES_TEMPLATE = (name: string) => `import { Hono } from 'hono';
import { ${name}Service } from './service';

export const ${name}Routes = new Hono();

${name}Routes.get('/', (c) => {
  return c.json({ message: 'Hello from ${name} module!' });
});
`;

const SERVICE_TEMPLATE = (name: string) => `export class ${name.charAt(0).toUpperCase() + name.slice(1)}Service {
  // Add your business logic here
}

export const ${name}Service = new ${name.charAt(0).toUpperCase() + name.slice(1)}Service();
`;

const TYPES_TEMPLATE = (name: string) => `// Add your interfaces and types for the ${name} module here
export interface ${name.charAt(0).toUpperCase() + name.slice(1)}DTO {
  id: string;
}
`;

export async function generateModuleCommand(name: string) {
  const config = await loadConfig();
  if (!config) {
    console.error(pc.red('Error: hm.config.json not found. Please run `hm init` first.'));
    process.exit(1);
  }

  const baseDir = path.join(process.cwd(), config.directory);
  const moduleDir = path.join(baseDir, name);

  try {
    const stats = await fs.stat(moduleDir);
    if (stats.isDirectory()) {
      console.error(pc.red(`Error: Module '${name}' already exists at ${moduleDir}`));
      process.exit(1);
    }
  } catch {
    // Directory doesn't exist, which is what we want
  }

  console.log(pc.cyan(`Scaffolding module '${name}'...`));

  // Create directory
  await fs.mkdir(moduleDir, { recursive: true });

  // Write template files
  await fs.writeFile(path.join(moduleDir, 'module.ts'), MODULE_TEMPLATE(name), 'utf-8');
  await fs.writeFile(path.join(moduleDir, 'routes.ts'), ROUTES_TEMPLATE(name), 'utf-8');
  await fs.writeFile(path.join(moduleDir, 'service.ts'), SERVICE_TEMPLATE(name), 'utf-8');
  await fs.writeFile(path.join(moduleDir, 'types.ts'), TYPES_TEMPLATE(name), 'utf-8');

  // Automatically wire into registry
  console.log(pc.cyan(`Registering '${name}' module in ${config.directory}/index.ts...`));
  const registryPath = path.join(baseDir, 'index.ts');
  
  try {
    await addModuleToRegistry(registryPath, name);
  } catch (err: any) {
    console.error(pc.red(`Failed to automatically register module: ${err.message}`));
    console.log(pc.yellow(`Please manually add it to your registry.`));
  }

  console.log(pc.green(`✔ Successfully generated module '${name}'!`));
}
