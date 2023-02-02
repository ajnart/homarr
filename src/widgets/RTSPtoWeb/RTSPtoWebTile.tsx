import { Group } from '@mantine/core';
import { IconDeviceCctv } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import VideoFeed from './VideoFeed';

const definition = defineWidget({
  id: 'RTSPtoWeb',
  icon: IconDeviceCctv,
  options: {
    name: {
      type: 'text',
      defaultValue: '',
    },
    url: {
      type: 'text',
      defaultValue: '',
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: RTSPtoWebTile,
});

export type IRTSPtoWebWidget = IWidget<typeof definition['id'], typeof definition>;

interface RTSPtoWebTileProps {
  widget: IRTSPtoWebWidget;
}

function RTSPtoWebTile({ widget }: RTSPtoWebTileProps) {
  const cameraName = widget.properties.name;
  const stream = widget.properties.url;
  return (
    <div className="app">
      <Group position="center" w="100%">
      Camera 3
      </Group>
      <Group position="center" w="100%">
      <VideoFeed src="http://192.168.0.11:8083/stream/bcceb64a-7e5c-4065-819d-501ac1fd794d/channel/1/hls/live/index.m3u8" />
      </Group>
    </div>
  );
}

export default definition;
