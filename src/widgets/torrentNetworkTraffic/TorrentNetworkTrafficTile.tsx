import { IconArrowsUpDown } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'dlspeed',
  icon: IconArrowsUpDown,
  options: {},

  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 2,
    maxHeight: 2,
  },
  component: TorrentNetworkTrafficTile,
});

export type ITorrentNetworkTraffic = IWidget<typeof definition['id'], typeof definition>;

interface TorrentNetworkTrafficTileProps {
  widget: ITorrentNetworkTraffic;
}

function TorrentNetworkTrafficTile({ widget }: TorrentNetworkTrafficTileProps) {
  return null;
}

export default definition;
