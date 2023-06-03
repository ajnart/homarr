import {
  Avatar,
  Container,
  Group,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useElementSize } from '@mantine/hooks';
import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery } from './media-request-query';
import { MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-stats',
  icon: IconChartBar,
  options: {},
  component: MediaRequestStatsTile,
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type MediaRequestStatsWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaRequestStatsWidgetProps {
  widget: MediaRequestStatsWidget;
}

function MediaRequestStatsTile({ widget }: MediaRequestStatsWidgetProps) {
  const { t } = useTranslation('modules/media-requests-stats');
  const { data, isFetching } = useMediaRequestQuery();

  const { ref, width } = useElementSize();

  if (!data || isFetching) {
    return <WidgetLoading />;
  }

  const displayDescriptions = width > 400;

  let frequentRequesters: { username: string; userProfilePic: string; countRequests: number }[] =
    [];

  data.forEach((item) => {
    const match = frequentRequesters.find((x) => x.username === item.userName);
    if (match) {
      frequentRequesters = [
        ...frequentRequesters.filter((x) => x.username !== item.userName),
        {
          ...match,
          countRequests: match.countRequests + 1,
        },
      ];
    } else {
      frequentRequesters.push({
        username: item.userName,
        countRequests: 1,
        userProfilePic: item.userProfilePicture,
      });
    }
  });

  const mostOftenRequester = frequentRequesters
    .sort((x, y) => (x.countRequests > y.countRequests ? -1 : 1))
    .find(() => true);

  return (
    <Container ref={ref} h="100%" px={0}>
      <ScrollArea h="100%" type="auto" offsetScrollbars>
        <Stack pr="xs">
          <Group position="apart">
            <Stack spacing={0}>
              <Title order={6}>Pending approval</Title>
              {displayDescriptions && <Text>Count of requests pending your approval</Text>}
            </Stack>
            <Text>
              {
                data.filter((request) => request.status === MediaRequestStatus.PendingApproval)
                  .length
              }
            </Text>
          </Group>
          <Group position="apart">
            <Stack spacing={0}>
              <Title order={6}>Declined requests</Title>
              {displayDescriptions && <Text>Count of requests that were declined</Text>}
            </Stack>
            <Text>
              {data.filter((request) => request.status === MediaRequestStatus.Declined).length}
            </Text>
          </Group>
          {mostOftenRequester && (
            <Group position="apart">
              <Stack spacing={0}>
                <Title order={6}>Most frequent requester</Title>
                {displayDescriptions && <Text>The user that has requested the most often</Text>}
              </Stack>
              <Stack spacing={0}>
                <Group>
                  <Avatar src={mostOftenRequester.userProfilePic} size="sm" />
                  <Text>{mostOftenRequester.username}</Text>
                </Group>
                <Text color="dimmed" size="xs">
                  made {mostOftenRequester.countRequests} requests
                </Text>
              </Stack>
            </Group>
          )}
        </Stack>
      </ScrollArea>
    </Container>
  );
}

export default definition;
