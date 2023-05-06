import { ConfigAppType, IntegrationField } from '../../types/app';

export const findAppProperty = (app: ConfigAppType, key: IntegrationField) =>
  app.integration?.properties.find((prop) => prop.field === key)?.value ?? '';
