import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { useColorTheme } from '../tools/color';
import { ConfigType } from '../types/config';
import { useConfigStore } from './store';

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

export const ConfigProvider = ({
  children,
  config: fallbackConfig,
}: {
  children: ReactNode;
  config?: ConfigType;
}) => {
  const [configName, setConfigName] = useState<string>(
    fallbackConfig?.configProperties.name || 'unknown'
  );
  const [configVersion, setConfigVersion] = useState(0);
  const { configs } = useConfigStore((s) => ({ configs: s.configs }), shallow);
  const { setPrimaryColor, setSecondaryColor, setPrimaryShade } = useColorTheme();

  const currentConfig = configs.find((c) => c.value.configProperties.name === configName)?.value;

  useEffect(() => {
    const config = currentConfig ?? fallbackConfig;
    if (!config) return;
    setPrimaryColor(config?.settings.customization.colors.primary ?? 'red');
    setSecondaryColor(config?.settings.customization.colors.secondary ?? 'orange');
    setPrimaryShade(config?.settings.customization.colors.shade ?? 6);
    return () => {
      setPrimaryColor('red');
      setSecondaryColor('orange');
      setPrimaryShade(6);
    };
  }, [currentConfig]);

  return (
    <ConfigContext.Provider
      value={{
        name: configName,
        config: currentConfig ?? fallbackConfig,
        configVersion,
        increaseVersion: () => setConfigVersion((v) => v + 1),
        setConfigName: (name: string) => setConfigName(name),
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfigContext = () => useContext(ConfigContext);
