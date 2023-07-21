import fs from 'fs';

import { generateConfigPath } from './generateConfigPath';

export function readConfig(name: string) {
  const path = generateConfigPath(name);
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
