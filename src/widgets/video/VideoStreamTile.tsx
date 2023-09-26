import { Center, Group, Stack, Title } from '@mantine/core';
import { IconDeviceCctv, IconHeartBroken } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { defineWidget } from '../helper';
import { IWidget } from '../widgets';

const VideoFeed = dynamic(() => import('./VideoFeed'), { ssr: false });

const definition = defineWidget({
  id: 'video-stream',
  icon: IconDeviceCctv,
  options: {
    FeedUrl: {
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
    minWidth: 1,
    minHeight: 1,
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
  if (!widget.properties.FeedUrl) {
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
        source={widget?.properties.FeedUrl}
        muted={widget?.properties.muted}
        autoPlay={widget?.properties.autoPlay}
        controls={widget?.properties.controls}
      />
    </Group>
  );
}

export default definition;
