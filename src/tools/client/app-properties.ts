import { ConfigAppType, IntegrationField, IntegrationType } from '~/types/app';

export const findAppProperty = (app: ConfigAppType, key: IntegrationField) =>
  app.integration?.properties.find((prop) => prop.field === key)?.value ?? '';

/** Checks if the type of an integration is part of the TIntegrations array with propper typing */
export const checkIntegrationsType = <
  TTest extends CheckIntegrationTypeInput,
  TIntegrations extends readonly IntegrationType[],
>(
  test: TTest | undefined | null,
  integrations: TIntegrations
): test is CheckIntegrationType<TTest, TIntegrations> => {
  if (!test) return false;
  return integrations.includes(test.type!);
};

type CheckIntegrationTypeInput = {
  type: IntegrationType | null;
};

type CheckIntegrationType<
  TInput extends CheckIntegrationTypeInput,
  TIntegrations extends readonly IntegrationType[],
> = TInput & {
  type: TIntegrations[number];
};
