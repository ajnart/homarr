// This interface is to be used in all the modules of the project
// Each module should have its own interface and call the following function:
// TODO: Add a function to register a module
// Note: Maybe use context to keep track of the modules
export interface IModule {
  title: string;
  description: string;
  icon: React.ReactNode;
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
