import { useEffect } from 'react';

import { ConfigType } from '../types/config';
import { useConfigContext } from './provider';
import { useConfigStore } from './store';

export const useInitConfig = (initialConfig: ConfigType) => {
  const { setConfigName, increaseVersion } = useConfigContext();
  const configName = initialConfig.configProperties?.name ?? 'default';
  const initConfig = useConfigStore((x) => x.initConfig);

  useEffect(() => {
    setConfigName(configName);
    initConfig(configName, initialConfig, increaseVersion);
  }, [configName]);
};
