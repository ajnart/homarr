import calendarDefinition from '../../../widgets/calendar/CalendarTile';
import clockDefinition from '../../../widgets/date/DateTile';
import dashDotDefinition from '../../../widgets/dashDot/DashDotTile';
import useNetDefinition from '../../../widgets/useNet/UseNetTile';
import weatherDefinition from '../../../widgets/weather/WeatherTile';
import { EmptyTile } from './EmptyTile';
import { ServiceTile } from './Service/ServiceTile';

// TODO: just remove and use service (later app) directly. For widgets the the definition should contain min/max width/height
type TileDefinitionProps = {
  [key in keyof any | 'service']: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    component: React.ElementType;
  };
};

export const Tiles: TileDefinitionProps = {
  service: {
    component: ServiceTile,
    minWidth: 2,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
  bitTorrent: {
    component: EmptyTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  calendar: {
    component: calendarDefinition.component,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  clock: {
    component: clockDefinition.component,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
  dashDot: {
    component: dashDotDefinition.component,
    minWidth: 4,
    maxWidth: 9,
    minHeight: 5,
    maxHeight: 14,
  },
  torrentNetworkTraffic: {
    component: EmptyTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  useNet: {
    component: useNetDefinition.component,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  weather: {
    component: weatherDefinition.component,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
};
