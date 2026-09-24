import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let cached: Record<string, string> | null = null;

function loadEnvFile(): Record<string, string> {
  if (cached) return cached;

  const moduleRoot = dirname(fileURLToPath(import.meta.url));
  const projectRoot =
    [join(moduleRoot, '..', '..'), process.cwd()].find((p) => existsSync(join(p, '.env.local')) || existsSync(join(p, '.env'))) ??
    join(moduleRoot, '..', '..');
  const parsed: Record<string, string> = {};

  for (const file of ['.env.local', '.env']) {
    try {
      const content = readFileSync(join(projectRoot, file), 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const idx = trimmed.indexOf('=');
        if (idx === -1) continue;
        const key = trimmed.slice(0, idx).trim();
        let value = trimmed.slice(idx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key) parsed[key] = value;
      }
    } catch {
      // file missing — continue
    }
  }

  cached = parsed;
  return parsed;
}

export function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  return loadEnvFile()[key];
}