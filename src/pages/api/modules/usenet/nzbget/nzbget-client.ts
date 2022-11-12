import NZBGet from 'nzbget-api';
import { NzbgetClientOptions } from './types';

export function NzbgetClient(options: NzbgetClientOptions) {
  if (!options?.host) {
    throw new Error('Cannot connect to NZBGet. Missing host in service config.');
  }

  if (!options?.port) {
    throw new Error('Cannot connect to NZBGet. Missing port in service config.');
  }

  if (!options?.login) {
    throw new Error('Cannot connect to NZBGet. Missing username in service config.');
  }

  if (!options?.hash) {
    throw new Error('Cannot connect to NZBGet. Missing password in service config.');
  }

  return new NZBGet(options);
}
