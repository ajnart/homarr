import { BackendConfigType } from '../../types/config';
import { configExists } from './configExists';
import { getFallbackConfig } from './getFallbackConfig';
import { migrateConfig } from './migrateConfig';
import { readConfig } from './readConfig';

export const getConfig = (name: string): BackendConfigType => {
  if (!configExists(name)) return getFallbackConfig();
  // Else if config exists but contains no "schema_version" property
  // then it is an old config file and we should try to migrate it
  // to the new format.
  let config = readConfig(name);
  if (!config.schemaVersion) {
    // TODO: Migrate config to new format
    config = migrateConfig(config);
  }
  return config;
};
