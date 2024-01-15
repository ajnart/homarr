import { Button, Card, Flex, Group, Text } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconReportSearch, IconTestPipe } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { defineWidget } from '../helper';
import { WidgetLoading } from '../loading';
import { IWidget } from '../widgets';

const definition = defineWidget({
  id: 'indexer-manager',
  icon: IconReportSearch,
  options: {},
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 3,
    maxHeight: 3,
  },
  component: IndexerManagerWidgetTile,
});

export type IIndexerManagerWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface IndexerManagerWidgetProps {
  widget: IIndexerManagerWidget;
}

function IndexerManagerWidgetTile({ widget }: IndexerManagerWidgetProps) {
  const { t } = useTranslation('modules/indexer-manager');
  const { isInitialLoading, data } = useProwlarrIndexersQuery();

  if (isInitialLoading || !data) {
    return <WidgetLoading />;
  }

  const handleTestAllClick = async () => {
    useProwlarrTestAll();
  };

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={2}>{t('indexersStatus.title')}</Text>
      <Card py={5} px={10} radius="md" withBorder>
        {data.map((indexer: any) => (
          <Group key={indexer.id} position="apart">
            <Text color="dimmed" align="center" size="xs">
              {indexer.name}
            </Text>
            {indexer.enable ? <IconCircleCheck color="#2ecc71" /> : <IconCircleX color="#d9534f" />}
          </Group>
        ))}
      </Card>
      <Button
        mt={5}
        variant="light"
        onClick={handleTestAllClick}
        rightIcon={<IconTestPipe size={20} />}
      >
        {t('indexersStatus.testAllButton')}
      </Button>
    </Flex>
  );
}

export const useProwlarrIndexersQuery = () => {
  const { name: configName } = useConfigContext();

  return api.indexerManager.indexers.useQuery(
    {
      configName: configName!,
    },
    {
      staleTime: 1000 * 60 * 2,
    }
  );
};

export const useProwlarrTestAll = () => {
  const { name: configName } = useConfigContext();
  const mutation = api.indexerManager.testAllIndexers.useMutation();
  return mutation.mutate({
    configName: configName!,
  });
};

export default definition;
