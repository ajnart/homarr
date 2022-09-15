// This interface is to be used in all the modules of the project
// Each module should have its own interface and call the following function:
// TODO: Add a function to register a module

import { Modules } from '@homarr/graphql';
import { TablerIcon } from '@tabler/icons';

// Note: Maybe use context to keep track of the modules
export interface IModule {
  id: string;
  dataKey: keyof Omit<Modules, '__typename'>;
  title: string;
  icon: TablerIcon;
  component: React.ComponentType;
  options?: Option;
}

interface Option {
  [x: string]: OptionValues;
}

export interface OptionValues {
  name: string;
  value: boolean | string | string[];
  options?: string[];
}
