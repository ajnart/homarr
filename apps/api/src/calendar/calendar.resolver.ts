import { Args, Query, Resolver } from '@nestjs/graphql';
import { RadarrService } from '../radarr/radar.service';
import { SonarrService } from '../sonarr/sonarr.service';
import { CalendarItems } from './models/calendarItems.model';

@Resolver(() => CalendarItems)
export class CalendarResolver {
  constructor(private radarrService: RadarrService, private sonarrService: SonarrService) {}

  @Query(() => [CalendarItems])
  async calendar(@Args('startDate') startDate: Date, @Args('endDate') endDate: Date) {
    return [
      ...(await this.radarrService.getCalendar({
        startDate,
        endDate,
      })),
      ...(await this.sonarrService.getCalendar()),
    ];
  }
}
