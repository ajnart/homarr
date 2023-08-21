import { Card, Divider, Flex, Grid, Group, Text } from '@mantine/core';
import { IconDeviceMobile, IconId } from '@tabler/icons-react';

import { GenericSessionInfo } from '../../types/api/media-server/session-info';
import { useTranslation } from 'react-i18next';

export const DetailCollapseable = ({ session }: { session: GenericSessionInfo }) => {
  let details: { title: string; metrics: { name: string; value: string | undefined }[] }[] = [];
  const { t } = useTranslation('modules/media-server-list');

  if (session.currentlyPlaying) {
    if (session.currentlyPlaying.metadata.video) {
      details = [
        ...details,
        {
          title: t('detail.video.'),
          metrics: [
            {
              name: t('detail.video.resolution'),
              value: `${session.currentlyPlaying.metadata.video.width}x${session.currentlyPlaying.metadata.video.height}`,
            },
            {
              name: t('detail.video.framerate'),
              value: session.currentlyPlaying.metadata.video.videoFrameRate,
            },
            {
              name: t('detail.video.codec'),
              value: session.currentlyPlaying.metadata.video.videoCodec,
            },
            {
              name: 'Bitrate',
              value: session.currentlyPlaying.metadata.video.bitrate
                ? String(session.currentlyPlaying.metadata.video.bitrate)
                : undefined,
            },
          ],
        },
      ];
    }
    if (session.currentlyPlaying.metadata.audio) {
      details = [
        ...details,
        {
          title: t('detail.audio.audio'),
          metrics: [
            {
              name: t('detail.audio.channels'),
              value: `${session.currentlyPlaying.metadata.audio.audioChannels}`,
            },
            {
              name: t('detail.audio.codec'),
              value: session.currentlyPlaying.metadata.audio.audioCodec,
            },
          ],
        },
      ];
    }

    if (session.currentlyPlaying.metadata.transcoding) {
      details = [
        ...details,
        {
          title: t('detail.transcoding.transcoding'),
          metrics: [
            {
              name: t('detail.video.resolution'),
              value: `${session.currentlyPlaying.metadata.transcoding.width}x${session.currentlyPlaying.metadata.transcoding.height}`,
            },
            {
              name: t('detail.transcoding.context'),
              value: session.currentlyPlaying.metadata.transcoding.context,
            },
            {
              name: t('detail.transcoding.requested'),
              value: session.currentlyPlaying.metadata.transcoding.transcodeHwRequested
                ? 'yes'
                : 'no',
            },
            {
              name: t('detail.transcoding.source'),
              value:
                session.currentlyPlaying.metadata.transcoding.sourceAudioCodec ||
                session.currentlyPlaying.metadata.transcoding.sourceVideoCodec
                  ? `${session.currentlyPlaying.metadata.transcoding.sourceVideoCodec} ${session.currentlyPlaying.metadata.transcoding.sourceAudioCodec}`
                  : undefined,
            },
            {
              name: t('detail.transcoding.target'),
              value: `${session.currentlyPlaying.metadata.transcoding.videoCodec} ${session.currentlyPlaying.metadata.transcoding.audioCodec}`,
            },
          ],
        },
      ];
    }
  }

  return (
    <Card>
      <Flex justify="space-between" mb="xs">
        <Group>
          <IconId size={16} />
          <Text>{t('detail.id')}</Text>
        </Group>
        <Text>{session.id}</Text>
      </Flex>
      <Flex justify="space-between" mb="md">
        <Group>
          <IconDeviceMobile size={16} />
          <Text>{t('detail.device')}</Text>
        </Group>
        <Text>{session.sessionName}</Text>
      </Flex>
      {details.length > 0 && (
        <Divider label={t('detail.label')} labelPosition="center" mt="lg" mb="sm" />
      )}
      <Grid>
        {details.map((detail, index) => (
          <Grid.Col xs={12} sm={6} key={index}>
            <Text weight="bold">{detail.title}</Text>
            {detail.metrics
              .filter((x) => x.value !== undefined)
              .map((metric, index2) => (
                <Group position="apart" key={index2}>
                  <Text>{metric.name}</Text>
                  <Text>{metric.value}</Text>
                </Group>
              ))}
          </Grid.Col>
        ))}
      </Grid>
    </Card>
  );
};
