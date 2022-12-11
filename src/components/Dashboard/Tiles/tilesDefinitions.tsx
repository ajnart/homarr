import { IntegrationsType } from '../../../types/integration';
import { CalendarTile } from './Calendar/CalendarTile';
import { ClockTile } from './Clock/ClockTile';
import { EmptyTile } from './EmptyTile';
import { ServiceTile } from './Service/ServiceTile';
import { WeatherTile } from './Weather/WeatherTile';
/*import { CalendarTile } from './calendar';
import { ClockTile } from './clock';
import { DashDotTile } from './dash-dot';*/

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
    component: EmptyTile, //DashDotTile,
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
    component: EmptyTile, //CalendarTile,
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
