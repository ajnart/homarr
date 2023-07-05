import type {
  ConfigAppIntegrationType,
  ConfigAppType,
  Integration,
  IntegrationField,
  IntegrationType,
} from '~/types/app';
import type { IntegrationTypeMap } from '~/types/config';

export const findAppProperty = (app: ConfigAppType, key: IntegrationField) =>
  app.integration?.properties.find((prop) => prop.field === key)?.value ?? '';

export function checkIntegrationsType(
  integrations: ConfigAppIntegrationType | undefined,
  types: IntegrationType[]
): boolean {
  if (!integrations || !integrations.type) {
    return false;
  }
  return types.includes(integrations.type);
}
/** Checks if the type of an integration is part of the TIntegrations array with propper typing */

export const findIntegrationProperty = (integration: Integration, key: IntegrationField) =>
  integration.properties.find((prop) => prop.field === key)?.value ?? undefined;

// Returns all the integrations of the passed types in 2nd argument, first argument is the list of all integrations, return type is a list of integration[]
export function findIntegrationsByType(
  integrations: IntegrationTypeMap | undefined,
  types: IntegrationType[]
): Integration[] {
  if (!integrations) {
    return [];
  }
  // Return all integrations that are of any of the types passed in the 2nd argument, if not found, return an empty array
  return types.reduce((acc, type) => [...acc, ...(integrations[type] ?? [])], [] as Integration[]);
}

export function findIntegrationByType(
  integration: IntegrationTypeMap | undefined,
  types: IntegrationType[]
): Integration | undefined {
  if (!integration) {
    return undefined;
  }
  // Return the first integration that is of any of the types passed in the 2nd argument, if not found, return undefined
  return types.reduce(
    (acc, type) => acc ?? integration[type]?.[0],
    undefined as Integration | undefined
  );
}
