import { ConfigType } from '~/types/config';

export const getLowestWrapper = (config: ConfigType) => config?.wrappers.sort((a, b) => a.position - b.position)[0];