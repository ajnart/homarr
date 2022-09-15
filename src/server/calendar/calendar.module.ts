import { Module } from '@nestjs/common';
import { RadarrModule } from '../radarr/radarr.module';
import { SonarrModule } from '../sonarr/sonarr.module';
import { CalendarController } from './calendar.controller';
import { CalendarResolver } from './calendar.resolver';

@Module({
  providers: [CalendarResolver],
  controllers: [CalendarController],
  imports: [RadarrModule, SonarrModule],
})
export class CalendarModule {}
