import { ConfigType } from '../../types/config';
import { getConfig } from './getConfig';

export const getFrontendConfig = (name: string): ConfigType => {
  const config = getConfig(name);

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
