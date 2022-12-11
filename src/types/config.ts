import { CategoryType } from './category';
import { WrapperType } from './wrapper';
import { ConfigServiceType, ServiceType } from './service';
import { IntegrationsType } from './integration';
import { SettingsType } from './settings';

export interface ConfigType {
  schemaVersion: string;
  configProperties: ConfigPropertiesType;
  categories: CategoryType[];
  wrappers: WrapperType[];
  services: ServiceType[];
  integrations: IntegrationsType;
  settings: SettingsType;
}

export type BackendConfigType = Omit<ConfigType, 'services'> & {
  services: ConfigServiceType[];
};

export interface ConfigPropertiesType {
  name: string;
}
