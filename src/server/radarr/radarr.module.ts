import { FactoryProvider, Module, Scope } from '@nestjs/common';
import { ServiceType } from '../configs/config.model';
import { ConfigService } from '../configs/config.service';
import { RadarrService } from './radar.service';
import { RadarrClient } from './radarr.client';
import { RADARR_CLIENT } from './radarr.const';

const ApiProvider: FactoryProvider<RadarrClient[]> = {
  provide: RADARR_CLIENT,
  async useFactory(configService: ConfigService) {
    const services = await configService.getServices(ServiceType.Radarr);

    return services.map((s) => new RadarrClient({ apiKey: s.apiKey!, apiUrl: s.url }));
  },
  inject: [ConfigService],
  scope: Scope.REQUEST,
};

@Module({
  providers: [RadarrService, ApiProvider],
  exports: [RadarrService],
})
export class RadarrModule {}
