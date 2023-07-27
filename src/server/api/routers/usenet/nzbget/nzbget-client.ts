import NZBGet from 'nzbget-api';

import { NzbgetClientOptions } from './types';

export function NzbgetClient(options: NzbgetClientOptions) {
  if (!options?.host) {
    throw new Error('Cannot connect to NZBGet. Missing host in app config.');
  }

  if (!options?.port) {
    throw new Error('Cannot connect to NZBGet. Missing port in app config.');
  }

  if (!options?.login) {
    throw new Error('Cannot connect to NZBGet. Missing username in app config.');
  }

  if (!options?.hash) {
    throw new Error('Cannot connect to NZBGet. Missing password in app config.');
  }

  return new NZBGet(options);
}
