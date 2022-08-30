import { Module } from '@nestjs/common';
import { RadarrModule } from '../radarr/radarr.module';
import { CalendarController } from './calendar.controller';

@Module({
  controllers: [CalendarController],
  imports: [RadarrModule],
})
export class CalendarModule {}
