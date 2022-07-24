import { IconEyeglass } from '@tabler/icons';
import { IModule } from '../ModuleTypes';
import OverseerrMediaDisplay from './OverseerrMediaDisplay';

export const OverseerrModule: IModule = {
  title: 'Overseerr',
  description: 'Allows you to search and add media from Overseerr',
  icon: IconEyeglass,
  component: OverseerrMediaDisplay,
};

export interface OverseerSearchProps {
  query: string;
}
