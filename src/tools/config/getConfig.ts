import Consola from 'consola';
import { v4 as uuidv4 } from 'uuid';
import { BackendConfigType, ConfigType } from '../../types/config';
import { backendMigrateConfig } from './backendMigrateConfig';
import { configExists } from './configExists';
import { getFallbackConfig } from './getFallbackConfig';
import { readConfig } from './readConfig';
import { writeConfig } from './writeConfig';

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const getConfig = (name: string): BackendConfigType => {
  if (!configExists(name)) return getFallbackConfig() as unknown as ConfigType;
  // Else if config exists but contains no "schema_version" property
  // then it is an old config file and we should try to migrate it
  // to the new format.
  const config = readConfig(name);
  if (config.schemaVersion === undefined) {
    Consola.log('Migrating config file...', config.name);
    return backendMigrateConfig(config, name);
  }

  let backendConfig = config as BackendConfigType;

  if (backendConfig.widgets.some((widget) => !uuidRegex.test(widget.id))) {
    backendConfig = {
      ...backendConfig,
      widgets: backendConfig.widgets.map((widget) => ({
        ...widget,
        id: uuidv4(),
        type: widget.id,
      })),
    };

    Consola.log(
      'Migrating config file to multiple widgets...',
      backendConfig.configProperties.name
    );

    writeConfig(backendConfig);
  }

  return backendConfig;
};
