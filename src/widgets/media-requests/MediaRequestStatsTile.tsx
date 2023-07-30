import { Box, Card, createStyles, Flex, FlexProps, Stack, Text } from '@mantine/core';
import { IconChartBar } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';
import { useMediaRequestQuery } from './media-request-query';
import { MediaRequestStatus } from './media-request-types';

const definition = defineWidget({
  id: 'media-requests-stats',
  icon: IconChartBar,
  options: {
    direction: {
      type: 'select',
      defaultValue: 'horizontal',
      data: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ],
    },
  },
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
  const { data, isFetching } = useMediaRequestQuery();

  if (!data || isFetching) {
    return <WidgetLoading />;
  }

  return (
    <Flex
      w="100%"
      h="100%"
      gap="md"
      direction={ widget.properties.direction != 'vertical' ? 'row' : 'column' }
    >
      <Card w="100%" h="100%" withBorder style={{flex:"1 1 auto"}}>
        <Stack w="100%" h="100%" align="center" justify="center" spacing={0}>
          <Text align="center">
            {data.filter((x) => x.status === MediaRequestStatus.PendingApproval).length}
          </Text>
          <Text color="dimmed" align="center" size="xs">
            {t('stats.pending')}
          </Text>
        </Stack>
      </Card>
      <Card w="100%" h="100%" withBorder style={{flex:"1 1 auto"}}>
        <Stack w="100%" h="100%" align="center" justify="center" spacing={0}>
          <Text align="center">
            {data.filter((x) => x.type === 'tv').length}
          </Text>
          <Text color="dimmed" align="center" size="xs">
            {t('stats.tvRequests')}
          </Text>
        </Stack>
      </Card>
      <Card w="100%" h="100%" withBorder style={{flex:"1 1 auto"}}>
        <Stack w="100%" h="100%" align="center" justify="center" spacing={0}>
          <Text align="center">
            {data.filter((x) => x.type === 'movie').length}
          </Text>
          <Text color="dimmed" align="center" size="xs">
            {t('stats.movieRequests')}
          </Text>
        </Stack>
      </Card>
    </Flex>
  );
}

export default definition;