import { ConfigType } from '../../types/config';
import { getConfig } from './getConfig';

export const getFrontendConfig = (name: string): ConfigType => {
  const config = getConfig(name);

  return {
    ...config,
    services: config.services.map((s) => ({
      ...s,
      integration: s.integration
        ? {
            ...s.integration,
            properties: s.integration?.properties.map((p) => ({
              ...p,
              value: p.type === 'private' ? null : p.value,
              isDefined: p.value != null,
            })),
          }
        : null,
    })),
  };
};
