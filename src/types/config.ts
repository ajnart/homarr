import { IWidget } from '../widgets/widgets';
import { Integration, AppType, ConfigAppType, IntegrationType } from './app';
import { CategoryType } from './category';
import { SettingsType } from './settings';
import { WrapperType } from './wrapper';

export type IntegrationTypeMap = {
  [key in IntegrationType]: Integration[];
};

export interface ConfigType {
  schemaVersion: number;
  configProperties: ConfigPropertiesType;
  categories: CategoryType[];
  wrappers: WrapperType[];
  apps: AppType[];
  widgets: IWidget<string, any>[];
  settings: SettingsType;
  integrations: IntegrationTypeMap;
}

export type BackendConfigType = Omit<ConfigType, 'apps'> & {
  apps: ConfigAppType[];
};

export interface ConfigPropertiesType {
  name: string;
}
