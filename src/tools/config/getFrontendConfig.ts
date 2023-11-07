import Consola from 'consola';
import fs from 'fs';
import { fetchCity } from '~/server/api/routers/weather';
import { IntegrationField } from '~/types/app';
import { BackendConfigType, ConfigType } from '~/types/config';

import { getConfig } from './getConfig';

export const getFrontendConfig = async (name: string): Promise<ConfigType> => {
  let config = getConfig(name);
  let shouldMigrateConfig = false;

  config = migrateAppConfigs(config);

  const anyWeatherWidgetWithStringLocation = config.widgets.some(
    (widget) => widget.type === 'weather' && typeof widget.properties.location === 'string'
  );

  if (anyWeatherWidgetWithStringLocation) {
    config = await migrateLocation(config);
    shouldMigrateConfig = true;
  }

  const anyPiholeIntegrationWithPassword = config.apps.some(
    (app) =>
      app?.integration?.type === 'pihole' &&
      app?.integration?.properties.length &&
      app.integration.properties.some((property) => property.field === 'password')
  );

  if (anyPiholeIntegrationWithPassword) {
    config = migratePiholeIntegrationField(config);
    shouldMigrateConfig = true;
  }

  if (shouldMigrateConfig) {
    Consola.info(`Migrating config ${config.configProperties.name}`);
    fs.writeFileSync(
      `./data/configs/${config.configProperties.name}.json`,
      JSON.stringify(config, null, 2)
    );
  }

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

const migrateLocation = async (config: BackendConfigType) => {
  Consola.log('Migrating config file to new location schema...', config.configProperties.name);

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

  return migratedConfig;
};

const migratePiholeIntegrationField = (config: BackendConfigType) => {
  Consola.log('Migrating pihole integration field to apiKey...', config.configProperties.name);
  return {
    ...config,
    apps: config.apps.map((app) => {
      if (app?.integration?.type === 'pihole' && Array.isArray(app?.integration?.properties)) {
        const migratedProperties = app.integration.properties.map((property) => {
          if (property.field === 'password') {
            return {
              ...property,
              field: 'apiKey' as IntegrationField,
            };
          }
          return property;
        });
        return { ...app, integration: { ...app.integration, properties: migratedProperties } };
      }
      return app;
    }),
  };
};

const migrateAppConfigs = (config: BackendConfigType) => {
  return {
    ...config,
    apps: config.apps.map((app) => ({
      ...app,
      appearance: {
        ...app.appearance,
        appNameStatus: app.appearance.appNameStatus ?? 'normal',
        positionAppName: app.appearance.positionAppName ?? 'column',
        appNameFontSize: app.appearance.appNameFontSize ?? 16,
        lineClampAppName: app.appearance.lineClampAppName ?? 1,
      },
    })),
  };
};
