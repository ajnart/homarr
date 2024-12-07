import {
  Avatar,
  Card,
  Flex,
  Group,
  Indicator,
  Stack,
  Text,
  Tooltip,
  Image,
  useMantineTheme,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconChartBar, IconExternalLink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery, useUsersQuery } from './media-request-query';
import { MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-stats',
  icon: IconChartBar,
  options: {
    replaceLinksWithExternalHost: {
      type: 'switch',
      defaultValue: false,
    },
    openInNewTab: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
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
  const {
    data: mediaData,
    isFetching: mediaFetching,
    isLoading: mediaLoading,
  } = useMediaRequestQuery(widget);
  const {
    data: usersData,
    isFetching: usersFetching,
    isLoading: usersLoading,
  } = useUsersQuery(widget);
  const { ref, height } = useElementSize();
  const { colorScheme } = useMantineTheme();

  if (!mediaData || !usersData || mediaLoading || usersLoading) {
    return (
      <Stack ref={ref} h="100%">
        <WidgetLoading />
      </Stack>
    );
  }

  const appList: string[] = [];
  mediaData.forEach((item) => {
    if (!appList.includes(item.appId)) appList.push(item.appId);
  });

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
      label: t('mediaStats.approved'),
      number: mediaData.filter((x) => x.status === MediaRequestStatus.Approved).length,
    },
    {
      label: t('mediaStats.totalRequests'),
      number: mediaData.length,
    },
  ];

  const users = usersData
    .sort((x, y) => (x.userRequestCount > y.userRequestCount ? -1 : 1))
    .slice(0, Math.trunc(height / 60));

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={-5}>{t('mediaStats.title')}</Text>
      <Card py={5} px={10} radius="md" style={{ overflow: 'unset' }} withBorder>
        {baseStats.map((stat, index) => {
          return (
            <Group key={index} position="apart">
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
      <Text mt={2}>{t('userStats.title')}</Text>
      <Stack ref={ref} style={{ flex: 1 }} spacing={5} p={0} sx={{ overflow: 'hidden' }}>
        {users.map((user) => {
          return (
            <Card
              key={user.id}
              p={0}
              component="a"
              href={user.userLink}
              target={widget.properties.openInNewTab ? '_blank' : '_self'}
              mah={95}
              mih={55}
              radius="md"
              style={{ flex: 1 }}
              withBorder
            >
              <Group
                spacing={5}
                px={10}
                py={5}
                align="center"
                h="100%"
                display="flex"
                style={{ flexDirection: 'row' }}
              >
                {appList.length > 1 && (
                  <Tooltip.Floating
                    label={user.app.charAt(0).toUpperCase() + user.app.slice(1)}
                    c={colorScheme === 'light' ? 'black' : 'dark.0'}
                    color={colorScheme === 'light' ? 'gray.2' : 'dark.4'}
                  >
                    <Indicator
                      withBorder
                      top={18}
                      left={8}
                      size={15}
                      ml={-5}
                      zIndex={1}
                      color={user.app === 'overseerr' ? '#ECB000' : '#6677CC'}
                      processing={mediaFetching || usersFetching}
                      children
                    />
                  </Tooltip.Floating>
                )}
                <Avatar radius="xl" size={45} src={user.userProfilePicture} alt="user avatar" >
                  <Image src={user.fallbackUserProfilePicture} alt="user avatar" />
                </Avatar>
                <Stack spacing={0} style={{ flex: 1 }}>
                  <Text>{user.userName}</Text>
                  <Text size="xs">
                    {t('userStats.requests', { number: user.userRequestCount })}
                  </Text>
                </Stack>
                <IconExternalLink size={20} />
              </Group>
            </Card>
          );
        })}
      </Stack>
    </Flex>
  );
}

export default definition;
