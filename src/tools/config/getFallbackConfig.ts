import defaultConfig from '../../../data/configs/default.json';

export const getFallbackConfig = (name?: string) => ({
  ...defaultConfig,
  configProperties: {
    name: name ?? 'default',
  },
});
