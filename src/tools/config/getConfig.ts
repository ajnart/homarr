import { BackendConfigType, ConfigType } from '../../types/config';
import { configExists } from './configExists';
import { getFallbackConfig } from './getFallbackConfig';
import { readConfig } from './readConfig';

export const getConfig = (name: string): BackendConfigType => {
  if (!configExists(name)) return getFallbackConfig() as unknown as ConfigType;
  const config = readConfig(name);

  return config;
};
