import Consola from 'consola';

import { ConfigType } from '../../types/config';
import { getConfig } from './getConfig';

export const getFrontendConfig = (name: string): ConfigType => {
  const config = getConfig(name);

  Consola.info(`Requested frontend content of configuration '${name}'`);
  // Find out if config as apps with integrations that have a property with no value or undefined
  // If so, remove print an error using consola
  // If not, return the config
  const appsWithIntegrationsWithUndefinedProperties = config.apps.filter(
    (app) =>
      app.integration?.properties.some(
        (property) => property.value === null || property.value === undefined
      ) ?? false
  );
  if (appsWithIntegrationsWithUndefinedProperties.length > 0) {
    Consola.warn(
      `The following apps have integrations with errored properties: [${appsWithIntegrationsWithUndefinedProperties
        .map((app) => app.name)
        .join(', ')}] please input the correct secrets once again for the concerned app(s), save them, exit edit mode and reload the page.`
    );
  }

  return {
    ...config,
    apps: config.apps.map((app) => ({
      ...app,
      integration: {
        ...(app.integration ?? null),
        type: app.integration?.type ?? null,
        properties:
          app.integration?.properties.map((property) => ({
            ...property,
            value: property.type === 'private' ? null : property.value,
            isDefined: property.value !== null,
          })) ?? [],
      },
    })),
  };
};
