import { Controller, Get } from '@nestjs/common';
import { RadarrService } from '../radarr/radar.service';
import { SonarrService } from '../sonarr/sonarr.service';

@Controller('/modules/calendar')
export class CalendarController {
  constructor(private radarrService: RadarrService, private sonarrService: SonarrService) {}

  @Get()
  public async calendar() {
    return [
      // ...(await this.radarrService.getCalendar()),
      ...(await this.sonarrService.getCalendar()),
    ];
  }
}
