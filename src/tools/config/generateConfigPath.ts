import path from 'path';

export const generateConfigPath = (configName: string) =>
  path.join(process.cwd(), 'data/configs', `${configName}.json`);
