import {
  Anchor,
  Button,
  Card,
  Flex,
  Group,
  ScrollArea,
  Text,
  useMantineTheme,
} from '@mantine/core';
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
  options: {
    openIndexerSiteInNewTab: {
      type: 'switch',
      defaultValue: true,
    },
  },
  gridstack: {
    minWidth: 1,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 12,
  },
  component: IndexerManagerWidgetTile,
});

export type IIndexerManagerWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface IndexerManagerWidgetProps {
  widget: IIndexerManagerWidget;
}

function IndexerManagerWidgetTile({ widget }: IndexerManagerWidgetProps) {
  const { t } = useTranslation('modules/indexer-manager');
  const mantineTheme = useMantineTheme();
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
        refetchInterval: 1000 * 60 * 2,
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
              <Anchor
                href={indexer.indexerUrls[0]}
                target={widget.properties.openIndexerSiteInNewTab ? '_blank' : '_self'}
                c={mantineTheme.colorScheme === 'dark' ? 'gray.3' : 'gray.8'}
              >
                <Text color="dimmed" align="center" size="xs">
                  {indexer.name}
                </Text>
              </Anchor>
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
