import { v4 as uuidv4 } from 'uuid';
import { Config } from './types';

export function migrateToIdConfig(config: Config): Config {
  // Set the config and add an ID to all the services that don't have one
  const services = config.apps.map((service) => ({
    ...service,
    id: service.id ?? uuidv4(),
  }));
  return {
    ...config,
    apps: services,
  };
}
