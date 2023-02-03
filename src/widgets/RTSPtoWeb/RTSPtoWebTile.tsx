import { Group } from '@mantine/core';
import { IconDeviceCctv } from '@tabler/icons';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import VideoFeed from './VideoFeed';

const definition = defineWidget({
  id: 'RTSPtoWeb',
  icon: IconDeviceCctv,
  options: {
    camera1: {
      type: 'text',
      defaultValue: '',
    },
    camera2: {
      type: 'text',
      defaultValue: '',
    },
    camera3: {
      type: 'text',
      defaultValue: '',
    },
    camera4: {
      type: 'text',
      defaultValue: '',
    },
    camera5: {
      type: 'text',
      defaultValue: '',
    },
  },
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: RTSPtoWebWidget,
});

export type IRTSPtoWebWidget = IWidget<typeof definition['id'], typeof definition>;

interface RTSPtoWebWidgetProps {
  widget: IRTSPtoWebWidget;
}

function RTSPtoWebWidget({ widget }: RTSPtoWebWidgetProps) {
  const camera1 = widget?.properties.camera1;
  const camera2 = widget?.properties.camera2;
  const camera3 = widget?.properties.camera3;
  const camera4 = widget?.properties.camera4;
  const camera5 = widget?.properties.camera5;
  return (
    <div className="app">
      <Group position="center" w="100%">
      <VideoFeed src={camera1} />
      <VideoFeed src={camera2} />
      </Group>
    </div>
  );
}

export default definition;
