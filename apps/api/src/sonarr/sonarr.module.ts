import { FactoryProvider, Module, Scope } from '@nestjs/common';
import { ConfigService } from '../configs/config.service';
import { ServiceType } from '../configs/models/serviceType.enum';
import { SonarrClient } from './sonarr.client';
import { SONARR_CLIENT } from './sonarr.const';
import { SonarrService } from './sonarr.service';

const ApiProvider: FactoryProvider<SonarrClient[]> = {
  provide: SONARR_CLIENT,
  async useFactory(configService: ConfigService) {
    const services = await configService.getServices(ServiceType.Sonarr);

    return services.map((s) => new SonarrClient({ apiKey: s.apiKey!, apiUrl: s.url }));
  },
  inject: [ConfigService],
  scope: Scope.REQUEST,
};

@Module({
  providers: [SonarrService, ApiProvider],
  exports: [SonarrService],
})
export class SonarrModule {}
