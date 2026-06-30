#!/usr/bin/env node
import cac from 'cac';
import * as pc from 'picocolors';

const cli = cac('hm');

cli
  .command('init', 'Initialize hono-modules in your project')
  .action(() => {
    console.log(pc.green('Initializing hono-modules...'));
    // TODO: Implement init logic
  });

cli
  .command('generate <type> <name>', 'Generate a module, route, or service (alias: g)')
  .alias('g')
  .action((type: string, name: string) => {
    if (type === 'module' || type === 'm') {
      console.log(pc.green(`Generating module ${name}...`));
      // TODO: Implement module generation logic
    } else {
      console.log(pc.red(`Unknown generation type: ${type}`));
    }
  });

cli
  .command('enable <module>', 'Enable a module')
  .action((module: string) => {
    console.log(pc.green(`Enabling module ${module}...`));
    // TODO: Implement toggle logic
  });

cli
  .command('disable <module>', 'Disable a module')
  .action((module: string) => {
    console.log(pc.yellow(`Disabling module ${module}...`));
    // TODO: Implement toggle logic
  });

cli.help();
cli.version('0.1.0');

try {
  cli.parse();
} catch (err: any) {
  console.error(pc.red(err.message));
  process.exit(1);
}
