import {
  ActionIcon,
  Anchor,
  Badge,
  Card,
  Center,
  Flex,
  Group,
  Image,
  ScrollArea,
  Stack,
  Text,
  Tooltip,
  Avatar,
  useMantineTheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconGitPullRequest, IconThumbDown, IconThumbUp } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery } from './media-request-query';
import { MediaRequest, MediaRequestAvailability, MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-list',
  icon: IconGitPullRequest,
  options: {
    replaceLinksWithExternalHost: {
      type: 'switch',
      defaultValue: true,
    },
    openInNewTab: {
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

type MediaRequestDecisionVariables = {
  request: MediaRequest;
  isApproved: boolean;
};
const useMediaRequestDecisionMutation = () => {
  const { name: configName } = useConfigContext();
  const utils = api.useContext();
  const { mutateAsync } = api.overseerr.decide.useMutation({
    onSuccess() {
      utils.mediaRequest.allMedia.invalidate();
      utils.mediaRequest.users.invalidate();
    },
  });
  const { t } = useTranslation('modules/media-requests-list');
  return async (variables: MediaRequestDecisionVariables) => {
    const action = variables.isApproved ? t('mutation.approving') : t('mutation.declining');
    notifications.show({
      id: `decide-${variables.request.id}`,
      color: 'yellow',
      title: `${action} ${t('mutation.request')}`,
      message: undefined,
      loading: true,
    });
    await mutateAsync(
      {
        configName: configName!,
        id: variables.request.id,
        isApproved: variables.isApproved,
      },
      {
        onSuccess(_data, variables) {
          const title = variables.isApproved ? t('mutation.approved') : t('mutation.declined');
          notifications.update({
            id: `decide-${variables.id}`,
            color: 'teal',
            title,
            message: undefined,
            icon: <IconCheck size="1rem" />,
            autoClose: 2000,
          });
        },
      }
    );
  };
};

function MediaRequestListTile({ widget }: MediaRequestListWidgetProps) {
  const { t } = useTranslation('modules/media-requests-list');
  const { data, isLoading } = useMediaRequestQuery(widget);
  // Use mutation to approve or deny a pending request
  const decideAsync = useMediaRequestDecisionMutation();
  const { data: sessionData } = useSession();

  const mantineTheme = useMantineTheme();

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
    <ScrollArea h="100%">
      <Stack>
        {sortedData.map((item, index) => (
          <Card radius="md" withBorder key={index}>
            <Flex wrap="nowrap" justify="space-between" gap="md">
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
                    <MediaRequestStatusBadge
                      status={item.status}
                      availability={item.availability}
                    />
                  </Group>
                  <Anchor
                    href={item.href}
                    target={widget.properties.openInNewTab ? '_blank' : '_self'}
                    c={mantineTheme.colorScheme === 'dark' ? 'gray.3' : 'gray.8'}
                  >
                    <Text lineClamp={1}>{item.name}</Text>
                  </Anchor>
                </Stack>
              </Flex>
              <Stack justify="center">
                <Flex gap="xs">
                  <Avatar
                    src={item.userProfilePicture}
                    size={25}
                    alt="requester avatar"
                    radius="xl"
                  >
                    <Image
                      src={item.fallbackUserProfilePicture}
                      alt="requester avatar"
                    />
                  </Avatar>
                  <Anchor
                    href={item.userLink}
                    target={widget.properties.openInNewTab ? '_blank' : '_self'}
                    c={mantineTheme.colorScheme === 'dark' ? 'gray.3' : 'gray.8'}
                  >
                    {item.userName}
                  </Anchor>
                </Flex>

                {item.status === MediaRequestStatus.PendingApproval &&
                  sessionData?.user?.isAdmin && (
                    <Group>
                      <Tooltip label={t('tooltips.approve')} withArrow withinPortal>
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={async () => {
                            notifications.show({
                              id: `approve ${item.id}`,
                              color: 'yellow',
                              title: t('tooltips.approving'),
                              message: undefined,
                              loading: true,
                            });

                            await decideAsync({
                              request: item,
                              isApproved: true,
                            });
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
                            await decideAsync({
                              request: item,
                              isApproved: false,
                            });
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
    </ScrollArea>
  );
}

const MediaRequestStatusBadge = ({
  status,
  availability,
}: {
  status: MediaRequestStatus;
  availability: MediaRequestAvailability;
}) => {
  const { t } = useTranslation('modules/media-requests-list');
  switch (status) {
    case MediaRequestStatus.Approved:
      switch (availability) {
        case MediaRequestAvailability.Available:
          return <Badge color="green">{t('state.available')}</Badge>;
        case MediaRequestAvailability.Partial:
          return <Badge color="yellow">{t('state.partial')}</Badge>;
        default:
          return <Badge color="violet">{t('state.approved')}</Badge>;
      }
    case MediaRequestStatus.Declined:
      return <Badge color="red">{t('state.declined')}</Badge>;
    case MediaRequestStatus.PendingApproval:
      return <Badge color="orange">{t('state.pendingApproval')}</Badge>;
    default:
      return <></>;
  }
};

export default definition;
