import create from 'zustand';
import { ConfigType } from '../types/config';

export const useConfigStore = create<UseConfigStoreType>((set, get) => ({
  configs: [],
  initConfig: (name, config) => {
    set((old) => ({
      ...old,
      configs: [...old.configs.filter((x) => x.configProperties?.name !== name), config],
    }));
  },
  // TODO: use callback with current config as input
  updateConfig: async (name, updateCallback: (previous: ConfigType) => ConfigType) => {
    const { configs } = get();
    const currentConfig = configs.find((x) => x.configProperties.name === name);
    if (!currentConfig) return;

    // TODO: update config on server
    const updatedConfig = updateCallback(currentConfig);

    set((old) => ({
      ...old,
      configs: [...old.configs.filter((x) => x.configProperties.name !== name), updatedConfig],
    }));
  },
}));

interface UseConfigStoreType {
  configs: ConfigType[];
  initConfig: (name: string, config: ConfigType) => void;
  updateConfig: (
    name: string,
    updateCallback: (previous: ConfigType) => ConfigType
  ) => Promise<void>;
}
