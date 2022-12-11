import { ConfigType } from '../../types/config';
import { configExists } from './configExists';
import { getFallbackConfig } from './getFallbackConfig';
import { readConfig } from './readConfig';

export const getConfig = (name: string): ConfigType => {
  if (!configExists(name)) return getFallbackConfig();
  return readConfig(name);
};
