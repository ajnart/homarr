import { Module } from '@nestjs/common';
import { RadarrModule } from '../radarr/radarr.module';
import { SonarrModule } from '../sonarr/sonarr.module';
import { CalendarResolver } from './calendar.resolver';

@Module({
  providers: [CalendarResolver],
  imports: [RadarrModule, SonarrModule],
})
export class CalendarModule {}
