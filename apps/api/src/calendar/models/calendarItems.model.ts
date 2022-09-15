import { createUnionType } from '@nestjs/graphql';
import { MovieCalendarItem } from './movieCalendarItem.model';
import { TvCalendarItem } from './tvCalendarItem.model';

export const CalendarItems = createUnionType({
  name: 'CalendarItem',
  types: () => [MovieCalendarItem, TvCalendarItem] as const,
  resolveType(item: MovieCalendarItem | TvCalendarItem) {
    if ((item as MovieCalendarItem).movieTitle) {
      return MovieCalendarItem;
    }

    if ((item as TvCalendarItem).seriesTitle) {
      return TvCalendarItem;
    }

    return null;
  },
});
