import { IconArrowsUpDown } from '@tabler/icons-react';
import dynamic from 'next/dynamic';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const torrentNetworkTrafficTile = dynamic(() => import('./Tile'), {
  ssr: false,
});

const definition = defineWidget({
  id: 'dlspeed',
  icon: IconArrowsUpDown,
  options: {},

  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: torrentNetworkTrafficTile,
});

export type ITorrentNetworkTraffic = IWidget<(typeof definition)['id'], typeof definition>;

export default definition;
