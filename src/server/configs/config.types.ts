import { ServiceType } from './config.model';

export interface Config {
  name: string;
  services: Service[];
  settings: Settings;
  modules: Record<string, Module>;
}

export interface Module {
  enabled: boolean;
}

export interface Service {
  name: string;
  id: string;
  type: ServiceType;
  icon: string;
  url: string;
}

export interface Settings {
  searchUrl: string;
}
