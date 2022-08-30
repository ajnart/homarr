import { Injectable } from '@nestjs/common';
import { readdir, readFile, writeFile } from 'fs/promises';
import { Config } from './config.types';

@Injectable()
export class ConfigService {
  public async getConfigs(): Promise<string[]> {
    const files = await readdir('data/configs');
    const configs = files.map((file) => file.replace('.json', ''));

    return configs;
  }

  public async getConfig(configName: string): Promise<Config> {
    const path = `data/configs/${configName}.json`;

    return JSON.parse(await readFile(path, 'utf8'));
  }

  public async writeConfig(configName: string, config: Config): Promise<Config> {
    const path = `data/configs/${configName}.json`;

    await writeFile(path, JSON.stringify(config, null, 2));

    return config;
  }
}
