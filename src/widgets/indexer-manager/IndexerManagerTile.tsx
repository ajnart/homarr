import { Button, Card, Flex, Group, ScrollArea, Text } from '@mantine/core';
import { IconCircleCheck, IconCircleX, IconReportSearch, IconTestPipe } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
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
  const { data: sessionData } = useSession();
  const { name: configName } = useConfigContext();
  const utils = api.useUtils();
  const { isLoading: testAllLoading, mutateAsync: testAllAsync } =
    api.indexerManager.testAllIndexers.useMutation({
      onSuccess: async () => {
        await utils.indexerManager.invalidate();
      },
    });
  const { isInitialLoading: indexersLoading, data: indexersData } =
    api.indexerManager.indexers.useQuery({
      configName: configName!,
    });
  const { isInitialLoading: statusesLoading, data: statusesData } =
    api.indexerManager.statuses.useQuery(
      {
        configName: configName!,
      },
      {
        staleTime: 1000 * 60 * 2,
      }
    );
  if (indexersLoading || !indexersData || statusesLoading) {
    return <WidgetLoading />;
  }

  return (
    <Flex h="100%" gap={0} direction="column">
      <Text mt={2}>{t('indexersStatus.title')}</Text>
      <Card py={5} px={10} radius="md" withBorder style={{ flex: '1' }}>
        <ScrollArea h="100%">
          {indexersData.map((indexer: any) => (
            <Group key={indexer.id} position="apart">
              <Text color="dimmed" align="center" size="xs">
                {indexer.name}
              </Text>
              {!statusesData.find((status: any) => indexer.id === status.indexerId) &&
              indexer.enable ? (
                <IconCircleCheck color="#2ecc71" />
              ) : (
                <IconCircleX color="#d9534f" />
              )}
            </Group>
          ))}
        </ScrollArea>
      </Card>
      {sessionData && (
        <Button
          mt={5}
          radius="md"
          variant="light"
          onClick={() => {
            testAllAsync({ configName: configName! });
          }}
          loading={testAllLoading}
          loaderPosition="right"
          rightIcon={<IconTestPipe size={20} />}
        >
          {t('indexersStatus.testAllButton')}
        </Button>
      )}
    </Flex>
  );
}

export default definition;
