import { IconEyeglass } from '@tabler/icons-react';

import { IModule } from '../ModuleTypes';
import { OverseerrMediaDisplay } from '../common';

export const OverseerrModule: IModule = {
  title: 'Overseerr',
  icon: IconEyeglass,
  component: OverseerrMediaDisplay,
  id: 'overseerr',
};

export interface OverseerSearchProps {
  query: string;
}
