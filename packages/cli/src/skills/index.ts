import fs from 'node:fs/promises';
import path from 'node:path';
import { architectureSkill } from './architecture';
import { workflowSkill } from './workflow';
import { rpcSkill } from './rpc';

export interface AgentSkill {
  name: string;
  content: string;
}

export const SKILLS_DIR = path.join('.agents', 'skills');

export const AGENT_SKILLS: readonly AgentSkill[] = [
  architectureSkill,
  workflowSkill,
  rpcSkill,
];

export async function installSkills(cwd = process.cwd()): Promise<string[]> {
  const installed: string[] = [];

  for (const skill of AGENT_SKILLS) {
    const skillDir = path.join(cwd, SKILLS_DIR, skill.name);
    const filePath = path.join(skillDir, 'SKILL.md');
    await fs.mkdir(skillDir, { recursive: true });
    await fs.writeFile(filePath, skill.content, 'utf-8');
    installed.push(path.join(SKILLS_DIR, skill.name, 'SKILL.md'));
  }

  return installed;
}
