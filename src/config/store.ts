import create from 'zustand';
import { ConfigType } from '../types/config';

export const useConfigStore = create<UseConfigStoreType>((set, get) => ({
  configs: [],
  initConfig: (name, config, increaseVersion) => {
    set((old) => ({
      ...old,
      configs: [
        ...old.configs.filter((x) => x.value.configProperties?.name !== name),
        { increaseVersion, value: config },
      ],
    }));
  },
  updateConfig: async (
    name,
    updateCallback: (previous: ConfigType) => ConfigType,
    shouldRegenerateGridstack = false
  ) => {
    const { configs } = get();
    const currentConfig = configs.find((x) => x.value.configProperties.name === name);
    if (!currentConfig) return;

    // TODO: update config on server
    const updatedConfig = updateCallback(currentConfig.value);
    set((old) => ({
      ...old,
      configs: [
        ...old.configs.filter((x) => x.value.configProperties.name !== name),
        { value: updatedConfig, increaseVersion: currentConfig.increaseVersion },
      ],
    }));

    if (shouldRegenerateGridstack) {
      currentConfig.increaseVersion();
    }
  },
}));

interface UseConfigStoreType {
  configs: { increaseVersion: () => void; value: ConfigType }[];
  initConfig: (name: string, config: ConfigType, increaseVersion: () => void) => void;
  updateConfig: (
    name: string,
    updateCallback: (previous: ConfigType) => ConfigType,
    shouldRegenerateGridstack?: boolean
  ) => Promise<void>;
}
