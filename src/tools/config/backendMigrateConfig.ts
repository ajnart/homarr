import fs from 'fs';
import { ConfigType } from '../../types/config';
import { Config } from '../types';
import { migrateConfig } from './migrateConfig';

export function backendMigrateConfig(config: Config, name: string): ConfigType {
  const migratedConfig = migrateConfig(config);

  // Make a backup of the old file ./data/configs/${name}.json
  // New name is ./data/configs/${name}.bak
  fs.copyFileSync(`./data/configs/${name}.json`, `./data/configs/${name}.json.bak`);

  // Overrite the file ./data/configs/${name}.json
  // with the new config format
  fs.writeFileSync(`./data/configs/${name}.json`, JSON.stringify(migratedConfig, null, 2));

  return migratedConfig;
}
