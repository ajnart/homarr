import { Center, Group, Stack, Title } from '@mantine/core';
import { IconDeviceCctv, IconHeartBroken } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import VideoFeed from './VideoFeed';

const definition = defineWidget({
  id: 'video-stream',
  icon: IconDeviceCctv,
  options: {
    cameraFeedUrl: {
      type: 'text',
      defaultValue: '',
    },
    autoPlay: {
      type: 'switch',
      defaultValue: true,
    },
    muted: {
      type: 'switch',
      defaultValue: true,
    },
    controls: {
      type: 'switch',
      defaultValue: false,
    },
  },
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: VideoStreamWidget,
});

export type VideoStreamWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface VideoStreamWidgetProps {
  widget: VideoStreamWidget;
}

function VideoStreamWidget({ widget }: VideoStreamWidgetProps) {
  const { t } = useTranslation('modules/video-stream');
  if (!widget.properties.cameraFeedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconHeartBroken />
          <Title order={4}>{t('errors.invalidStream')}</Title>
        </Stack>
      </Center>
    );
  }
  return (
    <Group position="center" w="100%" h="100%">
      <VideoFeed
        source={widget?.properties.cameraFeedUrl}
        muted={widget?.properties.muted}
        autoPlay={widget?.properties.autoPlay}
        controls={widget?.properties.controls}
      />
    </Group>
  );
}

export default definition;
