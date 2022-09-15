import { Injectable } from '@nestjs/common';
import { readdir, readFile, writeFile } from 'fs/promises';
import { Config as ConfigModel } from './models/config.model';
import { Config } from './config.types';
import { ServiceType } from './models/serviceType.enum';
import { Service } from './models/service.model';

@Injectable()
export class ConfigService {
  public async getConfigs(): Promise<ConfigModel[]> {
    const files = await readdir('../../data/configs');
    const configs = files.map((file) => file.replace('.json', ''));

    return Promise.all(configs.map(async (configName) => this.getConfig(configName)));
  }

  public async getConfig(configName: string): Promise<ConfigModel> {
    const path = `../../data/configs/${configName}.json`;

    const config = JSON.parse(await readFile(path, 'utf8')) as Config;

    return config;
  }

  public async getServices(...serviceTypes: ServiceType[]): Promise<Service[]> {
    const path = '../../data/services.json';

    const services = JSON.parse(await readFile(path, 'utf8')) as Service[];

    if (serviceTypes.length) {
      return services.filter((s) => serviceTypes.includes(s.type));
    }

    return services;
  }

  public async writeConfig(configName: string, config: Config): Promise<Config> {
    const path = `../../data/configs/${configName}.json`;

    await writeFile(path, JSON.stringify(config, null, 2));

    return config;
  }
}
