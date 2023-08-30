import { Avatar, Card, Flex, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconChartBar } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery, useUsersQuery } from './media-request-query';
import { MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-stats',
  icon: IconChartBar,
  options: {},
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: MediaRequestStatsTile,
});

export type MediaRequestStatsWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaRequestStatsWidgetProps {
  widget: MediaRequestStatsWidget;
}

function MediaRequestStatsTile({ widget }: MediaRequestStatsWidgetProps) {
  const { t } = useTranslation('modules/media-requests-stats');
  const { data: mediaData, isFetching: mediaFetching } = useMediaRequestQuery();
  const { data: usersData, isFetching: usersFetching } = useUsersQuery();
  const { ref, height } = useElementSize();

  if (!mediaData || mediaFetching || !usersData || usersFetching) {
    return <WidgetLoading />;
  }

  const baseStats: { label: string; number: number }[] = [
    {
      label: t('mediaStats.pending'),
      number: mediaData.filter((x) => x.status === MediaRequestStatus.PendingApproval).length,
    },
    {
      label: t('mediaStats.tvRequests'),
      number: mediaData.filter((x) => x.type === 'tv').length,
    },
    {
      label: t('mediaStats.movieRequests'),
      number: mediaData.filter((x) => x.type === 'movie').length,
    },
    {
      label: t('mediaStats.totalRequests'),
      number: mediaData.length,
    },
  ];

  const users: { username: string; avatar: string; href: string; requests: number }[] = usersData
    .sort((x, y) => x.userRequestCount - y.userRequestCount)
    .slice(0, Math.trunc(height / 50))
    .map((x) => {
      return {
        username: x.userName,
        avatar: x.userProfilePicture,
        href: x.userLink,
        requests: x.userRequestCount,
      };
    });

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={-7}>{t('mediaStats.title')}</Text>
      <Card withBorder py={5} px={10} style={{ overflow: 'unset' }}>
        {baseStats.map((stat) => {
          return (
            <Group position="apart">
              <Text color="dimmed" align="center" size="xs">
                {stat.label}
              </Text>
              <Text align="center" size="xs">
                {stat.number}
              </Text>
            </Group>
          );
        })}
      </Card>
      <Text mt={2} mb={-2}>{t('userStats.title')}</Text>
      <Stack ref={ref} style={{ flex: 1 }} spacing={0} p={0} sx={{ overflow: 'hidden' }}>
        {users.map((user) => {
          return (
            <Card
              withBorder
              p={0}
              my={3}
              component="a"
              href={user.href}
              target="_blank"
              mah={75}
              mih={50}
              style={{ flex: 1 }}
            >
              <Group spacing={0} align="center" h="100%">
                <Avatar m={5} size={35} src={user.avatar} alt="user avatar"/>
                <Stack spacing={0}>
                  <Text>{user.username}</Text>
                  <Text size="xs">{t('userStats.requests', {number: user.requests})}</Text>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Flex>
  );
}

export default definition;
