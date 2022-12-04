import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import shallow from 'zustand/shallow';
import { useColorTheme } from '../tools/color';
import { ConfigType } from '../types/config';
import { useConfigStore } from './store';

export type ConfigContextType = {
  config: ConfigType | undefined;
  name: string | undefined;
  setConfigName: (name: string) => void;
};

const ConfigContext = createContext<ConfigContextType>({
  name: 'unknown',
  config: undefined,
  setConfigName: () => console.error('Provider not set'),
});

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [configName, setConfigName] = useState<string>();
  const { configs } = useConfigStore((s) => ({ configs: s.configs }), shallow);
  const { setPrimaryColor, setSecondaryColor, setPrimaryShade } = useColorTheme();

  const currentConfig = configs.find((c) => c.configProperties.name === configName);

  useEffect(() => {
    setPrimaryColor(currentConfig?.settings.customization.colors.primary || 'red');
    setSecondaryColor(currentConfig?.settings.customization.colors.secondary || 'orange');
    setPrimaryShade(currentConfig?.settings.customization.colors.shade || 6);
  }, [configName]);

  return (
    <ConfigContext.Provider
      value={{
        name: configName,
        config: currentConfig,
        setConfigName: (name: string) => setConfigName(name),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => useContext(ConfigContext);
