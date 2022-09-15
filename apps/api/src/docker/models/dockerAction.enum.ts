import { registerEnumType } from '@nestjs/graphql';

export enum DockerAction {
  Remove = 'remove',
  Start = 'start',
  Stop = 'stop',
  Restart = 'restart',
}

registerEnumType(DockerAction, { name: 'DockerAction' });
