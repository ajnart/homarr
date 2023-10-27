import { createWithEqualityFn } from 'zustand/traditional';
import { ConfigType } from '~/types/config';
import { trcpProxyClient } from '~/utils/api';

export const useConfigStore = createWithEqualityFn<UseConfigStoreType>(
  (set, get) => ({
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
    addConfig: async (name: string, config: ConfigType) => {
      set((old) => ({
        ...old,
        configs: [
          ...old.configs.filter((x) => x.value.configProperties.name !== name),
          { value: config, increaseVersion: () => {} },
        ],
      }));
    },
    removeConfig: (name: string) => {
      set((old) => ({
        ...old,
        configs: old.configs.filter((x) => x.value.configProperties.name !== name),
      }));
    },
    updateConfig: async (
      name,
      updateCallback: (previous: ConfigType) => ConfigType,
      shouldRegenerateGridstack = false,
      shouldSaveConfigToFileSystem = false
    ) => {
      const { configs } = get();
      const currentConfig = configs.find((x) => x.value.configProperties.name === name);
      if (!currentConfig) {
        return;
      }
      // copies the value of currentConfig and creates a non reference object named previousConfig
      const previousConfig: ConfigType = JSON.parse(JSON.stringify(currentConfig.value));

      const updatedConfig = updateCallback(currentConfig.value);

      set((old) => ({
        ...old,
        configs: [
          ...old.configs.filter((x) => x.value.configProperties.name !== name),
          { value: updatedConfig, increaseVersion: currentConfig.increaseVersion },
        ],
      }));

      if (
        (typeof shouldRegenerateGridstack === 'boolean' && shouldRegenerateGridstack) ||
        (typeof shouldRegenerateGridstack === 'function' &&
          shouldRegenerateGridstack(previousConfig, updatedConfig))
      ) {
        currentConfig.increaseVersion();
      }

      if (shouldSaveConfigToFileSystem) {
        trcpProxyClient.config.save.mutate({
          name,
          config: updatedConfig,
        });
      }
    },
  }),
  Object.is
);

interface UseConfigStoreType {
  configs: { increaseVersion: () => void; value: ConfigType }[];
  initConfig: (name: string, config: ConfigType, increaseVersion: () => void) => void;
  addConfig: (name: string, config: ConfigType) => Promise<void>;
  removeConfig: (name: string) => void;
  updateConfig: (
    name: string,
    updateCallback: (previous: ConfigType) => ConfigType,
    shouldRegenerateGridstack?:
      | boolean
      | ((previousConfig: ConfigType, currentConfig: ConfigType) => boolean),
    shouldSaveConfigToFileSystem?: boolean
  ) => Promise<void>;
}
