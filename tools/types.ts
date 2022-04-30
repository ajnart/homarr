import { serviceItem } from '../components/AppShelf/AppShelf.d';

export interface Config {
  services: serviceItem[];
  settings: {};
  [key: string]: any;
}
