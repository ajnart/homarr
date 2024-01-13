import { Box, Button, Card, Flex, Group, Text } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconReportSearch, IconTestPipe } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
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
    maxWidth: 2,
    maxHeight: 2,
  },
  component: ProwlarrWidgetTile,
});

export type IProwlarrWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface ProwlarrWidgetProps {
  widget: IProwlarrWidget;
}

function ProwlarrWidgetTile({ widget }: ProwlarrWidgetProps) {
  const { t } = useTranslation('modules/prowlarr');
  const { isInitialLoading, data } = useProwlarrIndexersQuery();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  const handleTestAllClick = async () => {
    useProwlarrTestAll();
  };

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={2}>{t('Indexer Status')}</Text>
      <Card py={5} px={10} radius="md" style={{ overflow: 'unset' }} withBorder>
        {data.map((indexer: any) => (
          <Group key={indexer.id} position="apart">
            <Text color="dimmed" align="center" size="xs">
              {indexer.name}
            </Text>
            {indexer.enable ? <IconCircleCheck color="#2ecc71" /> : <IconCircleX color="#d9534f" />}
          </Group>
        ))}
      </Card>
      <Box mt={5}>
        <Button variant="light" onClick={handleTestAllClick} rightIcon={<IconTestPipe size={20} />}>
          {t('Test All')}
        </Button>
      </Box>
    </Flex>
  );
}

export const useProwlarrIndexersQuery = () => {
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

export const useProwlarrTestAll = () => {
  const { name: configName } = useConfigContext();
  const mutation = api.prowlarr.testAllIndexers.useMutation();
  return mutation.mutate({
    configName: configName!,
    integration: 'prowlarr',
  });
};

export default definition;
