import { z } from 'zod';
import { AppType, ConfigAppType, IntegrationType } from '~/types/app';
import { integrationTypes } from './integrations';
import { secretFields, secretTypes } from './secrets';
import { zodUnionLiteralsFromReadonlyStringArray } from './zod';

export const generateClientAppSchema = <TArray extends readonly IntegrationType[]>(array: TArray) =>
  z.object({
    id: z.string().uuid(),
    url: z.string(),
    externalUrl: z.string(),
    name: z.string(),
    integration: z.object({
      type: z.union(zodUnionLiteralsFromReadonlyStringArray(array)),
      properties: z.array(
        z.object({
          field: z.union(zodUnionLiteralsFromReadonlyStringArray(secretFields)),
          type: z.union(zodUnionLiteralsFromReadonlyStringArray(secretTypes)),
          value: z.string(),
        })
      ),
    }),
  });

export type ClientApp = z.infer<
  ReturnType<typeof generateClientAppSchema<typeof integrationTypes>>
>;

export const mergeClientAppsIntoServerApps = (
  clientApps: ClientApp[],
  serverApps: ConfigAppType[]
) =>
  clientApps.map((clientApp) => ({
    ...clientApp,
    integration: {
      ...clientApp.integration,
      properties: mergeSecretProperties(
        clientApp.integration.properties,
        serverApps
          .find((serverApp) => serverApp.id === clientApp.id)
          ?.integration?.properties.map((p) => ({
            ...p,
            value: p.value ?? '',
          }))
      ),
    },
  }));

export type ChangedClientSecret = ClientApp['integration']['properties'][number];

const mergeSecretProperties = (
  clientSecrets: ChangedClientSecret[],
  serverSecrets: ChangedClientSecret[] | undefined
) => [
  ...clientSecrets,
  ...(serverSecrets?.filter(
    (serverSecret) =>
      !clientSecrets.find(
        (clientSecret) =>
          clientSecret.field === serverSecret.field && clientSecret.type === serverSecret.type
      )
  ) ?? []),
];

export const constructClientSecretChangesForIntegrations = <
  TIntegrationTypes extends readonly IntegrationType[]
>(
  apps: AppType[],
  integrationTypes: TIntegrationTypes
) =>
  apps
    .filter((app) => {
      if (app.integration.type === null) return false;
      return integrationTypes.some((type) => app.integration.type === type);
    })
    .map(
      (app) =>
        ({
          id: app.id,
          name: app.name,
          url: app.url,
          externalUrl: app.behaviour.externalUrl,
          integration: {
            type: app.integration.type! as TIntegrationTypes[number],
            properties: app.integration.properties
              .filter((property) => property.value !== null && property.value !== undefined)
              .map((property) => ({
                field: property.field,
                type: property.type,
                value: property.value!,
              })),
          },
        } satisfies ClientApp)
    );
