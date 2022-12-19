import { CategoryType } from './category';
import { WrapperType } from './wrapper';
import { ConfigAppType, AppType } from './app';
import { SettingsType } from './settings';
import { IWidget } from '../widgets/widgets';

export interface ConfigType {
  schemaVersion: string;
  configProperties: ConfigPropertiesType;
  categories: CategoryType[];
  wrappers: WrapperType[];
  apps: AppType[];
  widgets: IWidget<string, any>[];
  settings: SettingsType;
}

export type BackendConfigType = Omit<ConfigType, 'apps'> & {
  apps: ConfigAppType[];
};

export interface ConfigPropertiesType {
  name: string;
}
