// This interface is to be used in all the modules of the project
// Each module should have its own interface and call the following function:
// TODO: Add a function to register a module

import { TablerIcon } from '@tabler/icons';

// Note: Maybe use context to keep track of the modules
export interface IModule {
  id: string;
  title: string;
  icon: TablerIcon;
  component: React.ComponentType;
  options?: Option;
  padding?: PaddingOptions = {
    right: 15,
    top: 15,
  };
}

interface PaddingOptions {
  top: number;
  right: number;
}

interface Option {
  [x: string]: OptionValues;
}

export interface OptionValues {
  name: string;
  value: boolean | string | string[];
  options?: string[];
}
