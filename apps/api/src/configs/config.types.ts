import { ServiceType } from './models/serviceType.enum';

export interface Config {
  name: string;
  services: Service[];
  settings: Settings;
  modules: Record<string, Module>;
}

export interface Module {
  enabled: boolean;
  title: string;
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
