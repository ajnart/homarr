import { CategoryType } from './category';
import { WrapperType } from './wrapper';
import { ConfigAppType, AppType } from './app';
import { IntegrationsType } from './integration';
import { SettingsType } from './settings';

export interface ConfigType {
  schemaVersion: string;
  configProperties: ConfigPropertiesType;
  categories: CategoryType[];
  wrappers: WrapperType[];
  apps: AppType[];
  integrations: IntegrationsType;
  settings: SettingsType;
}

export type BackendConfigType = Omit<ConfigType, 'apps'> & {
  apps: ConfigAppType[];
};

export interface ConfigPropertiesType {
  name: string;
}
