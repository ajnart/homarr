import fs from 'fs';

import { generateConfigPath } from './generateConfigPath';

export const configExists = (name: string) => {
  const path = generateConfigPath(name);
  return fs.existsSync(path);
};
