import { createContext, useContext } from 'react';
import { ConfigType } from '~/types/config';

export type ConfigContextType = {
  config: ConfigType | undefined;
  name: string | undefined;
  configVersion: number | undefined;
  increaseVersion: () => void;
  setConfigName: (name: string) => void;
};

const ConfigContext = createContext<ConfigContextType>({
  name: 'unknown',
  config: undefined,
  configVersion: undefined,
  increaseVersion: () => {},
  setConfigName: () => {},
});

export const useConfigContext = () => useContext(ConfigContext);
