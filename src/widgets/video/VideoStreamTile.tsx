import { Center, Group, Stack, Title } from '@mantine/core';
import { IconDeviceCctv, IconHeartBroken } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';

import { defineWidget } from '../helper';
import { IWidget, InferWidget } from '../widgets';

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

export type VideoStreamWidget = InferWidget<typeof definition>;

interface VideoStreamWidgetProps {
  widget: VideoStreamWidget;
}

function VideoStreamWidget({ widget }: VideoStreamWidgetProps) {
  const { t } = useTranslation('modules/video-stream');
  if (!widget.options.FeedUrl) {
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
        source={widget.options.FeedUrl}
        muted={widget.options.muted}
        autoPlay={widget.options.autoPlay}
        controls={widget.options.controls}
      />
    </Group>
  );
}

export default definition;
