import { Box, Card, Flex, Group, Text } from '@mantine/core';
import { IconReportSearch } from '@tabler/icons-react';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'prowlarr',
  icon: IconReportSearch,
  options: {},
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 3,
    maxHeight: 3,
  },
  component: ProwlarrWidgetTile,
});

export type IProwlarrWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface ProwlarrWidgetProps {
  widget: IProwlarrWidget;
}

function ProwlarrWidgetTile({ widget }: ProwlarrWidgetProps) {
  const { isInitialLoading, data } = useProwlarrIndexersQuery(widget);

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={2}>Indexer Status</Text>
      <Card py={5} px={10} radius="md" style={{ overflow: 'unset' }} withBorder>
        {data.map((indexer: any) => (
          <Group key={indexer.id} position="apart">
            <Text color="dimmed" align="center" size="xs">
              {indexer.name}
            </Text>
            <Box
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: indexer.enable ? '#2ecc71' : '#d9534f',
              }}
            />
          </Group>
        ))}
      </Card>
    </Flex>
  );
}

export const useProwlarrIndexersQuery = (widget: IProwlarrWidget) => {
  const { name: configName } = useConfigContext();

  return api.prowlarr.indexers.useQuery(
    {
      configName: configName!,
      integration: 'prowlarr',
    },
    {
      staleTime: 1000 * 60 * 2,
    }
  );
};

export default definition;
