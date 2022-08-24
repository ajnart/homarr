// This interface is to be used in all the modules of the project
// Each module should have its own interface and call the following function:
// TODO: Add a function to register a module

import { TablerIcon } from '@tabler/icons';

// Note: Maybe use context to keep track of the modules
export interface IModule {
  title: string;
  description: string;
  icon: TablerIcon;
  component: React.ComponentType;
  options?: Option;
  translationNamespace: string;
}

interface Option {
  [x: string]: OptionValues;
}

export interface OptionValues {
  name: string;
  value: boolean | string | string[];
  options?: string[];
}
