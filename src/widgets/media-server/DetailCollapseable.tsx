import { Card, Divider, Flex, Grid, Group, Text } from '@mantine/core';
import { IconDeviceMobile, IconId } from '@tabler/icons-react';
import { GenericSessionInfo } from '../../types/api/media-server/session-info';

export const DetailCollapseable = ({ session }: { session: GenericSessionInfo }) => {
  let details: { title: string; metrics: { name: string; value: string | undefined }[] }[] = [];

  if (session.currentlyPlaying) {
    if (session.currentlyPlaying.metadata.video) {
      details = [
        ...details,
        {
          title: 'Video',
          metrics: [
            {
              name: 'Resolution',
              value: `${session.currentlyPlaying.metadata.video.width}x${session.currentlyPlaying.metadata.video.height}`,
            },
            {
              name: 'Framerate',
              value: session.currentlyPlaying.metadata.video.videoFrameRate,
            },
            {
              name: 'Codec',
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
          title: 'Audio',
          metrics: [
            {
              name: 'Audio channels',
              value: `${session.currentlyPlaying.metadata.audio.audioChannels}`,
            },
            {
              name: 'Audio codec',
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
          title: 'Transcoding',
          metrics: [
            {
              name: 'Resolution',
              value: `${session.currentlyPlaying.metadata.transcoding.width}x${session.currentlyPlaying.metadata.transcoding.height}`,
            },
            {
              name: 'Context',
              value: session.currentlyPlaying.metadata.transcoding.context,
            },
            {
              name: 'Hardware encoding requested',
              value: session.currentlyPlaying.metadata.transcoding.transcodeHwRequested
                ? 'yes'
                : 'no',
            },
            {
              name: 'Source codec',
              value:
                session.currentlyPlaying.metadata.transcoding.sourceAudioCodec ||
                session.currentlyPlaying.metadata.transcoding.sourceVideoCodec
                  ? `${session.currentlyPlaying.metadata.transcoding.sourceVideoCodec} ${session.currentlyPlaying.metadata.transcoding.sourceAudioCodec}`
                  : undefined,
            },
            {
              name: 'Target codec',
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
          <Text>ID</Text>
        </Group>
        <Text>{session.id}</Text>
      </Flex>
      <Flex justify="space-between" mb="md">
        <Group>
          <IconDeviceMobile size={16} />
          <Text>Device</Text>
        </Group>
        <Text>{session.sessionName}</Text>
      </Flex>
      {details.length > 0 && (
        <Divider label="Stats for nerds" labelPosition="center" mt="lg" mb="sm" />
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
