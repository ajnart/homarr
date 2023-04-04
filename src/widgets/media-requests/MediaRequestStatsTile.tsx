import { Card, Center, Flex, Stack, Text } from '@mantine/core';
import { IconChartBar } from '@tabler/icons';
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
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type MediaRequestStatsWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface MediaRequestStatsWidgetProps {
  widget: MediaRequestStatsWidget;
}

function MediaRequestStatsTile({ widget }: MediaRequestStatsWidgetProps) {
  const { data, isFetching } = useMediaRequestQuery();

  if (!data || isFetching) {
    return <WidgetLoading />;
  }

  return (
    <Flex gap="md" wrap="wrap">
      <Card w={100} h={100} withBorder>
        <Center h="100%">
          <Stack spacing={0} align="center">
            <Text>
              {data.filter((x) => x.status === MediaRequestStatus.PendingApproval).length}
            </Text>
            <Text color="dimmed" align="center" size="xs">
              Pending approvals
            </Text>
          </Stack>
        </Center>
      </Card>
      <Card w={100} h={100} withBorder>
        <Center h="100%">
          <Stack spacing={0} align="center">
            <Text align="center">{data.filter((x) => x.type === 'tv').length}</Text>
            <Text color="dimmed" align="center" size="xs">
              TV requests
            </Text>
          </Stack>
        </Center>
      </Card>
      <Card w={100} h={100} withBorder>
        <Center h="100%">
          <Stack spacing={0} align="center">
            <Text align="center">{data.filter((x) => x.type === 'movie').length}</Text>
            <Text color="dimmed" align="center" size="xs">
              Movie requests
            </Text>
          </Stack>
        </Center>
      </Card>
    </Flex>
  );
}

export default definition;
