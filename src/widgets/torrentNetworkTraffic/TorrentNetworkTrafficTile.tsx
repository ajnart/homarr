import { IconClock } from '@tabler/icons';
import { HomarrCardWrapper } from '../../components/Dashboard/Tiles/HomarrCardWrapper';
import { BaseTileProps } from '../../components/Dashboard/Tiles/type';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'torrentNetworkTraffic',
  icon: IconClock,
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

interface TorrentNetworkTrafficTileProps extends BaseTileProps {
  module: ITorrentNetworkTraffic; // TODO: change to new type defined through widgetDefinition
}

function TorrentNetworkTrafficTile({ className, module }: TorrentNetworkTrafficTileProps) {
  return <HomarrCardWrapper>TorrentNetworkTraffic</HomarrCardWrapper>;
}

export default definition;
