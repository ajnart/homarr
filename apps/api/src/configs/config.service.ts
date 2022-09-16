import { Injectable } from '@nestjs/common';
import { readdir, readFile, writeFile } from 'fs/promises';
import { v4 } from 'uuid';
import { Config as ConfigModel } from './models/config.model';
import { Config } from './config.types';
import { ServiceType } from './models/serviceType.enum';
import { Service } from './models/service.model';
import { ServiceInput } from './models/serviceInput.model';

const SERVICES_PATH = '../../data/services.json';

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
    const services = JSON.parse(await readFile(SERVICES_PATH, 'utf8')) as Service[];

    if (serviceTypes.length) {
      return services.filter((s) => serviceTypes.includes(s.type));
    }

    return services;
  }

  public async saveService(
    serviceInput: ServiceInput,
    serviceId?: string
  ): Promise<{ services: Service[]; updatedService: Service }> {
    const services = await this.getServices();

    const updatedService = {
      ...serviceInput,
      id: serviceId || v4(),
    };

    if (serviceId) {
      const serviceIndex = services.findIndex((s) => s.id === serviceId);

      if (serviceIndex < 0) {
        throw new Error(`Service with id: ${serviceId} is not found.`);
      }

      services[serviceIndex] = updatedService;
    } else {
      services.push(updatedService);
    }

    await writeFile(SERVICES_PATH, JSON.stringify(services, null, 2));

    return {
      services,
      updatedService,
    };
  }

  public async deleteService(...serviceIds: string[]) {
    const services = await this.getServices();

    await writeFile(
      SERVICES_PATH,
      JSON.stringify(
        services.filter((f) => !serviceIds.some((id) => id === f.id)),
        null,
        2
      )
    );
  }

  public async writeConfig(configName: string, config: Config): Promise<Config> {
    const path = `../../data/configs/${configName}.json`;

    await writeFile(path, JSON.stringify(config, null, 2));

    return config;
  }
}
