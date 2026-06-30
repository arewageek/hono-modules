import fs from 'node:fs/promises';
import path from 'node:path';

export interface HmConfig {
  directory: string;
}

const CONFIG_FILE = 'hm.config.json';

export async function loadConfig(cwd = process.cwd()): Promise<HmConfig | null> {
  try {
    const content = await fs.readFile(path.join(cwd, CONFIG_FILE), 'utf-8');
    return JSON.parse(content) as HmConfig;
  } catch {
    return null;
  }
}

export async function writeConfig(config: HmConfig, cwd = process.cwd()): Promise<void> {
  await fs.writeFile(
    path.join(cwd, CONFIG_FILE),
    JSON.stringify(config, null, 2) + '\n',
    'utf-8'
  );
}
