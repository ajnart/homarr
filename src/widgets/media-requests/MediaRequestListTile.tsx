import {
  ActionIcon,
  Badge,
  Card,
  Center,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { IconCheck, IconGitPullRequest, IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery } from './media-request-query';
import { MediaRequest, MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-list',
  icon: IconGitPullRequest,
  options: {
    replaceLinksWithExternalHost: {
      type: 'switch',
      defaultValue: true,
    },
  },
  component: MediaRequestListTile,
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type MediaRequestListWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaRequestListWidgetProps {
  widget: MediaRequestListWidget;
}

function MediaRequestListTile({ widget }: MediaRequestListWidgetProps) {
  const { t } = useTranslation('modules/media-requests-list');
  const { data, refetch, isLoading } = useMediaRequestQuery();
  // Use mutation to approve or deny a pending request
  const mutate = useMutation({
    mutationFn: async (e: { request: MediaRequest; action: string }) => {
      const data = await axios.put(`/api/modules/overseerr/${e.request.id}?action=${e.action}`);
      notifications.show({
        title: t('requestUpdated'),
        message: t('requestUpdatedMessage', { title: e.request.name }),
        color: 'blue',
      });
      refetch();
    },
  });

  if (!data || isLoading) {
    return <WidgetLoading />;
  }

  if (data.length === 0) {
    return (
      <Center h="100%">
        <Text>{t('noRequests')}</Text>
      </Center>
    );
  }

  const countPendingApproval = data.filter(
    (x) => x.status === MediaRequestStatus.PendingApproval
  ).length;

  // Return a sorted data by status to show pending first, then the default order
  const sortedData = data.sort((a: MediaRequest, b: MediaRequest) => {
    if (a.status === MediaRequestStatus.PendingApproval) {
      return -1;
    }
    if (b.status === MediaRequestStatus.PendingApproval) {
      return 1;
    }
    return 0;
  });

  return (
    <Stack>
      {countPendingApproval > 0 ? (
        <Text>{t('pending', { countPendingApproval })}</Text>
      ) : (
        <Text>{t('nonePending')}</Text>
      )}
      {sortedData.map((item) => (
        <Card pos="relative" withBorder>
          <Flex justify="space-between" gap="md">
            <Flex gap="md">
              <Image
                src={item.posterPath}
                width={30}
                height={50}
                alt="poster"
                radius="xs"
                withPlaceholder
              />
              <Stack spacing={0}>
                <Group spacing="xs">
                  {item.airDate && <Text>{item.airDate.split('-')[0]}</Text>}
                  <MediaRequestStatusBadge status={item.status} />
                </Group>
                <Text
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  lineClamp={1}
                  weight="bold"
                  component="a"
                  href={item.href}
                >
                  {item.name}
                </Text>
              </Stack>
            </Flex>
            <Stack justify="center">
              <Flex gap="xs">
                <Image
                  src={item.userProfilePicture}
                  width={25}
                  height={25}
                  alt="requester avatar"
                  radius="xl"
                  withPlaceholder
                />
                <Text
                  component="a"
                  href={item.userLink}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {item.userName}
                </Text>
              </Flex>

              {item.status === MediaRequestStatus.PendingApproval && (
                <Group>
                  <Tooltip label={t('tooltips.approve')} withArrow withinPortal>
                    <ActionIcon
                      variant="light"
                      color="green"
                      onClick={async () => {
                        notifications.show({
                          id: `approve ${item.id}`,
                          color: 'yellow',
                          title: 'Approving request...',
                          message: undefined,
                          loading: true,
                        });

                        await mutate.mutateAsync({ request: item, action: 'approve' }).then(() =>
                          notifications.update({
                            id: `approve ${item.id}`,
                            color: 'teal',
                            title: 'Request was approved!',
                            message: undefined,
                            icon: <IconCheck size="1rem" />,
                            autoClose: 2000,
                          })
                        );

                        await refetch();
                      }}
                    >
                      <IconThumbUp />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('tooltips.decline')} withArrow withinPortal>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={async () => {
                        await mutate.mutateAsync({ request: item, action: 'decline' });
                        await refetch();
                      }}
                    >
                      <IconThumbDown />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            </Stack>
          </Flex>

          <Image
            src={item.backdropPath}
            pos="absolute"
            w="100%"
            h="100%"
            opacity={0.1}
            top={0}
            left={0}
            style={{ pointerEvents: 'none' }}
          />
        </Card>
      ))}
    </Stack>
  );
}

const MediaRequestStatusBadge = ({ status }: { status: MediaRequestStatus }) => {
  const { t } = useTranslation('modules/media-requests-list');
  switch (status) {
    case MediaRequestStatus.Approved:
      return <Badge color="green">{t('state.approved')}</Badge>;
    case MediaRequestStatus.Declined:
      return <Badge color="red">{t('state.declined')}</Badge>;
    case MediaRequestStatus.PendingApproval:
      return <Badge color="orange">{t('state.pendingApproval')}</Badge>;
    default:
      return <></>;
  }
};

export default definition;
