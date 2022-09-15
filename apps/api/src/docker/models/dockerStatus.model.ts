import { registerEnumType } from '@nestjs/graphql';

export enum DockerStatus {
  Running = 'running',
  Created = 'created',
  Exited = 'exited',
  Unknown = 'unknown',
}

registerEnumType(DockerStatus, { name: 'DockerStatus' });
