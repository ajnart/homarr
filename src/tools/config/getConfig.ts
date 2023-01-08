import Consola from 'consola';
import { BackendConfigType, ConfigType } from '../../types/config';
import { backendMigrateConfig } from './backendMigrateConfig';
import { configExists } from './configExists';
import { getFallbackConfig } from './getFallbackConfig';
import { readConfig } from './readConfig';

export const getConfig = (name: string): BackendConfigType => {
  if (!configExists(name)) return getFallbackConfig() as unknown as ConfigType;
  // Else if config exists but contains no "schema_version" property
  // then it is an old config file and we should try to migrate it
  // to the new format.
  const config = readConfig(name);
  if (config.schemaVersion === undefined) {
    Consola.log('Migrating config file...', config);
    return backendMigrateConfig(config, name);
  }

  return config;
};
