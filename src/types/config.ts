import { IWidget } from '~/widgets/widgets';

import { AppType, ConfigAppType } from './app';
import { CategoryType } from './category';
import { SettingsType } from './settings';
import { WrapperType } from './wrapper';

export interface ConfigType {
  schemaVersion: number;
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
