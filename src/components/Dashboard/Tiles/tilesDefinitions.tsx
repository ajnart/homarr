import { IntegrationsType } from '../../../types/integration';
import { CalendarTile } from '../../../widgets/calendar/CalendarTile';
import { ClockTile } from '../../../widgets/clock/ClockTile';
import { DashDotTile } from '../../../widgets/dashDot/DashDotTile';
import { UseNetTile } from '../../../widgets/useNet/UseNetTile';
import { WeatherTile } from '../../../widgets/weather/WeatherTile';
import { EmptyTile } from './EmptyTile';
import { ServiceTile } from './Service/ServiceTile';

// TODO: just remove and use service (later app) directly. For widgets the the definition should contain min/max width/height
type TileDefinitionProps = {
  [key in keyof IntegrationsType | 'service']: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    component: React.ElementType;
  };
};

// TODO: change components for other modules
export const Tiles: TileDefinitionProps = {
  service: {
    component: ServiceTile,
    minWidth: 2,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
  bitTorrent: {
    component: EmptyTile, //CalendarTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  calendar: {
    component: CalendarTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  clock: {
    component: ClockTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
  dashDot: {
    component: DashDotTile,
    minWidth: 4,
    maxWidth: 9,
    minHeight: 5,
    maxHeight: 14,
  },
  torrentNetworkTraffic: {
    component: EmptyTile, //CalendarTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  useNet: {
    component: UseNetTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  weather: {
    component: WeatherTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 2,
    maxHeight: 12,
  },
};
