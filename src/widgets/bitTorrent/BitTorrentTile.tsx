import { IconFileDownload } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'torrents-status',
  icon: IconFileDownload,
  options: {},
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 2,
    maxHeight: 2,
  },
  component: BitTorrentTile,
});

export type IBitTorrent = IWidget<typeof definition['id'], typeof definition>;

interface BitTorrentTileProps {
  widget: IBitTorrent;
}

function BitTorrentTile({ widget }: BitTorrentTileProps) {
  return null;
}

export default definition;
