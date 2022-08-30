import { Controller, Get } from '@nestjs/common';
import { Config } from '../configs/config.types';
import { RadarrService } from '../radarr/radar.service';
import { CurrentConfig } from '../utils/currentConfig.decorator';

@Controller('/modules/calendar')
export class CalendarController {
  constructor(private radarrService: RadarrService) {}

  @Get()
  public async calendar(@CurrentConfig() currentConfig: Config) {
    return this.radarrService.getCalendar(currentConfig.services[0].url);
  }
}
