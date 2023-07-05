import Consola from 'consola';
import fs from 'fs';
import { v4 } from 'uuid';
import { fetchCity } from '~/server/api/routers/weather';

import { BackendConfigType, ConfigType } from '../../types/config';
import { getConfig } from './getConfig';

export const getFrontendConfig = async (name: string): Promise<ConfigType> => {
  let config = getConfig(name);

  const anyWeatherWidgetWithStringLocation = config.widgets.some(
    (widget) => widget.type === 'weather' && typeof widget.properties.location === 'string'
  );

  if (anyWeatherWidgetWithStringLocation) {
    config = await migrateLocation(config);
  }

  Consola.info(`Requested frontend content of configuration '${name}'`);
  // If not, return the config
  const someAppsWithoutProps = config.apps.filter(
    (app) =>
      app.integration?.properties.some(
        (property) => property.value === null || property.value === undefined
      ) ?? false
  );
  if (someAppsWithoutProps.length > 0) {
    Consola.warn(
      `There are apps that have missing configuration options: [${someAppsWithoutProps
        .map((app) => app.name)
        .join(
          ', '
        )}] please input the correct secrets once again for the concerned app(s), save them, exit edit mode and reload the page.`
    );
  }

  return {
    ...config,
    apps: config.apps.map((app) => ({
      ...app,
      integration: {
        ...(app.integration ?? null),
        id: app.integration?.id ?? v4(),
        name: app.integration?.name ?? '',
        url: app.integration?.url ?? '',
        type: app.integration?.type ?? undefined,
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

const migrateLocation = async (config: BackendConfigType) => {
  Consola.log('Migrating config file to new location schema...', config.configProperties.name);

  const configName = config.configProperties.name;
  const migratedConfig = {
    ...config,
    widgets: await Promise.all(
      config.widgets.map(async (widget) =>
        widget.type !== 'weather' || typeof widget.properties.location !== 'string'
          ? widget
          : {
              ...widget,
              properties: {
                ...widget.properties,
                location: await fetchCity(widget.properties.location)
                  .then(({ results }) => ({
                    name: results[0].name,
                    latitude: results[0].latitude,
                    longitude: results[0].longitude,
                  }))
                  .catch(() => ({
                    name: '',
                    latitude: 0,
                    longitude: 0,
                  })),
              },
            }
      )
    ),
  };

  fs.writeFileSync(`./data/configs/${configName}.json`, JSON.stringify(migratedConfig, null, 2));

  return migratedConfig;
};
