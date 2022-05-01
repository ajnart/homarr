import { serviceItem } from './types';

export function pingQbittorrent(service: serviceItem): any {
  console.log('Getting service.cookie for service: ', service);
  if (!service.cookie) service.cookie = 'Test';
  else console.log(service.cookie);
}
