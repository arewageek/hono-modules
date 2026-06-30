#!/usr/bin/env node
import cac from 'cac';
import pc from 'picocolors';
import { initCommand } from './commands/init';
import { generateModuleCommand } from './commands/generate';

const cli = cac('hm');

cli
  .command('init', 'Initialize hono-modules in your project')
  .action(async () => {
    try {
      await initCommand();
    } catch (err: any) {
      console.error(pc.red(`Initialization failed: ${err.message}`));
    }
  });

cli
  .command('generate <type> <name>', 'Generate a module, route, or service (alias: g)')
  .alias('g')
  .action(async (type: string, name: string) => {
    if (type === 'module' || type === 'm') {
      try {
        await generateModuleCommand(name);
      } catch (err: any) {
        console.error(pc.red(`Generation failed: ${err.message}`));
      }
    } else {
      console.error(pc.red(`Unknown generation type: ${type}`));
    }
  });

cli
  .command('enable <module>', 'Enable a module')
  .action((module: string) => {
    console.log(pc.green(`Enabling module ${module}... (Not yet implemented)`));
  });

cli
  .command('disable <module>', 'Disable a module')
  .action((module: string) => {
    console.log(pc.yellow(`Disabling module ${module}... (Not yet implemented)`));
  });

cli.help();
cli.version('0.1.0');

try {
  cli.parse();
} catch (err: any) {
  console.error(pc.red(err.message));
  process.exit(1);
}
