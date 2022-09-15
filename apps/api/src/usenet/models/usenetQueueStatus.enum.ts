import { registerEnumType } from '@nestjs/graphql';

export enum UsenetQueueStatus {
  Paused = 'paused',
  Downloading = 'downloading',
  Queued = 'queued',
}

registerEnumType(UsenetQueueStatus, { name: 'UsenetQueueStatus' });
