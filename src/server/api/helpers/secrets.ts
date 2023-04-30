import { ConfigAppIntegrationType, IntegrationField } from '~/types/app';

export const getSecretValue = (
  secrets: ConfigAppIntegrationType['properties'],
  field: IntegrationField
) => secrets.find((secret) => secret.field === field)?.value ?? undefined;

export const secretFields = ['apiKey', 'password', 'username'] as const;
export const secretTypes = ['private', 'public'] as const;
