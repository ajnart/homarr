import { IconEyeglass } from '@tabler/icons';
import { OverseerrMediaDisplay } from '../common';
import { IModule } from '../ModuleTypes';

export const OverseerrModule: IModule = {
  title: 'Overseerr',
  description: 'Allows you to search and add media from Overseerr/Jellyseerr',
  icon: IconEyeglass,
  component: OverseerrMediaDisplay,
};

export interface OverseerSearchProps {
  query: string;
}
