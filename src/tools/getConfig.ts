import fs from 'fs';
import path from 'path';

import { ConfigType } from '../types/config';
import { getFallbackConfig } from './config/getFallbackConfig';

export function getConfig(name: string, props: any = undefined) {
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${name}.json`);
  if (!fs.existsSync(configPath)) {
    return getFallbackConfig() as unknown as ConfigType;
  }
  const config = fs.readFileSync(configPath, 'utf8');
  // Print loaded config
  return {
    props: {
      configName: name,
      config: JSON.parse(config),
      ...props,
    },
  };
}
