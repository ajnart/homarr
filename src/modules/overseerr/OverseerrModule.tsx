import { IconEyeglass } from '@tabler/icons';
import { OverseerrMediaDisplay } from '../common';
import { IModule } from '../ModuleTypes';

export const OverseerrModule: IModule = {
  title: 'descriptor.name',
  description: 'descriptor.description',
  icon: IconEyeglass,
  component: OverseerrMediaDisplay,
  translationNamespace: 'modules/overseerr-module',
};

export interface OverseerSearchProps {
  query: string;
}
