import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

@ObjectType()
export class Config {
  @Field()
  name: string;

  @Field(() => [Service])
  services: Service[];
}

@ObjectType()
export class Service {
  @Field()
  name: string;

  @Field()
  id: string;

  @Field(() => ServiceType)
  type: ServiceType;

  @Field()
  icon: string;

  @Field()
  url: string;

  @Field()
  apiKey?: string;
}

export enum ServiceType {
  Other = 'Other',
  DashDot = 'DashDot',
  Deluge = 'Deluge',
  Emby = 'Emby',
  Lidarr = 'Lidarr',
  Plex = 'Plex',
  qBittorrent = 'qBittorrent',
  Radarr = 'Radarr',
  Readarr = 'Readarr',
  Sonarr = 'Sonarr',
  Overseerr = 'Overseerr',
  Jellyseerr = 'Jellyseerr',
  Transmission = 'Transmission',
  Sabnzbd = 'Sabnzbd',
}

registerEnumType(ServiceType, { name: 'ServiceType' });
