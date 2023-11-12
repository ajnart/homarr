import fs from 'fs';
import { BackendConfigType } from '~/types/config';

import { generateConfigPath } from './generateConfigPath';

export function writeConfig(config: BackendConfigType) {
  const path = generateConfigPath(config.configProperties.name);
  return fs.writeFileSync(path, JSON.stringify(config, null, 4), {
    encoding: 'utf8',
  });
}
