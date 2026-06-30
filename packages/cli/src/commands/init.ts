import prompts from 'prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig, writeConfig } from '../utils/config';

export async function initCommand() {
  const existingConfig = await loadConfig();
  if (existingConfig) {
    console.log(pc.yellow('hono-modules is already initialized in this project.'));
    return;
  }

  console.log(pc.cyan('Welcome to hono-modules! Let\'s set up your project.\n'));

  const response = await prompts({
    type: 'text',
    name: 'directory',
    message: 'What directory should contain your modules?',
    initial: 'src/modules',
  });

  if (!response.directory) {
    console.log(pc.red('Initialization cancelled.'));
    return;
  }

  const dirPath = path.join(process.cwd(), response.directory);
  
  // Create directory
  await fs.mkdir(dirPath, { recursive: true });

  // Create the registry index.ts
  const registryCode = `import { ModuleRegistry } from 'hono-modules';

export const registry = new ModuleRegistry();

registry.register([
  // Modules will be automatically registered here by the CLI
]);
`;

  const indexPath = path.join(dirPath, 'index.ts');
  await fs.writeFile(indexPath, registryCode, 'utf-8');

  // Create config
  await writeConfig({ directory: response.directory });

  console.log(pc.green(`\n✔ Successfully initialized hono-modules!`));
  console.log(`Created configuration in ${pc.bold('hm.config.json')}`);
  console.log(`Created module registry at ${pc.bold(path.join(response.directory, 'index.ts'))}`);
  console.log(`\nNext steps:`);
  console.log(`1. Import the registry in your main app.ts:`);
  console.log(pc.dim(`   import { registry } from './${response.directory}';`));
  console.log(pc.dim(`   registry.applyTo(app);`));
  console.log(`2. Generate your first module:`);
  console.log(pc.dim(`   hm generate module <name>`));
}
