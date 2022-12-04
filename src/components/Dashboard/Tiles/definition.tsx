import { IntegrationsType } from '../../../types/integration';
import { ServiceTile } from './Service/Service';
/*import { CalendarTile } from './calendar';
import { ClockTile } from './clock';
import { DashDotTile } from './dash-dot';
import { WeatherTile } from './weather';*/

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
    component: CalendarTile,
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
    component: CalendarTile,
    minWidth: 4,
    maxWidth: 12,
    minHeight: 5,
    maxHeight: 12,
  },
  useNet: {
    component: CalendarTile,
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
