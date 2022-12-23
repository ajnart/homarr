import {
  Badge,
  Button,
  Group,
  Select,
  Stack,
  Tabs,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconFileDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { useEffect, useState } from 'react';

import { useElementSize } from '@mantine/hooks';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../config/provider';
import { useGetUsenetInfo, usePauseUsenetQueue, useResumeUsenetQueue } from '../../hooks/api';
import { humanFileSize } from '../../tools/humanFileSize';
import { AppIntegrationType } from '../../types/app';
import { defineWidget } from '../helper';
import { IWidget } from '../widgets';
import { UsenetHistoryList } from './UsenetHistoryList';
import { UsenetQueueList } from './UsenetQueueList';

dayjs.extend(duration);

const downloadAppTypes: AppIntegrationType['type'][] = ['sabnzbd', 'nzbGet'];

const definition = defineWidget({
  id: 'usenet',
  icon: IconFileDownload,
  options: {},
  component: UseNetTile,
  gridstack: {
    minWidth: 4,
    minHeight: 5,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type IWeatherWidget = IWidget<typeof definition['id'], typeof definition>;

interface UseNetTileProps {}

function UseNetTile({}: UseNetTileProps) {
  const { t } = useTranslation('modules/usenet');
  const { config } = useConfigContext();
  const downloadApps =
    config?.apps.filter((x) => x.integration && downloadAppTypes.includes(x.integration.type)) ??
    [];

  const [selectedAppId, setSelectedApp] = useState<string | null>(downloadApps[0]?.id);
  const { data } = useGetUsenetInfo({ appId: selectedAppId! });

  useEffect(() => {
    if (!selectedAppId && downloadApps.length) {
      setSelectedApp(downloadApps[0].id);
    }
  }, [downloadApps, selectedAppId]);

  const { mutate: pause } = usePauseUsenetQueue({ appId: selectedAppId! });
  const { mutate: resume } = useResumeUsenetQueue({ appId: selectedAppId! });

  if (downloadApps.length === 0) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noDownloadClients.title')}</Title>
        <Group>
          <Text>{t('card.errors.noDownloadClients.text')}</Text>
        </Group>
      </Stack>
    );
  }

  if (!selectedAppId) {
    return null;
  }

  const { ref, width, height } = useElementSize();
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;

  return (
    <Tabs keepMounted={false} defaultValue="queue">
      <Tabs.List ref={ref} mb="md" style={{ flex: 1 }} grow>
        <Tabs.Tab value="queue">{t('tabs.queue')}</Tabs.Tab>
        <Tabs.Tab value="history">{t('tabs.history')}</Tabs.Tab>
        {data && (
          <Group position="right" ml="auto">
            {width > MIN_WIDTH_MOBILE && (
              <>
                <Badge>{humanFileSize(data?.speed)}/s</Badge>
                <Badge>
                  {t('info.sizeLeft')}: {humanFileSize(data?.sizeLeft)}
                </Badge>
              </>
            )}
          </Group>
        )}
      </Tabs.List>
      {downloadApps.length > 1 && (
        <Select
          value={selectedAppId}
          onChange={setSelectedApp}
          ml="xs"
          data={downloadApps.map((app) => ({ value: app.id, label: app.name }))}
        />
      )}
      <Tabs.Panel value="queue">
        <UsenetQueueList appId={selectedAppId} />
        {!data ? null : data.paused ? (
          <Button uppercase onClick={() => resume()} radius="xl" size="xs" fullWidth mt="sm">
            <IconPlayerPlay size={12} style={{ marginRight: 5 }} /> {t('info.paused')}
          </Button>
        ) : (
          <Button uppercase onClick={() => pause()} radius="xl" size="xs" fullWidth mt="sm">
            <IconPlayerPause size={12} style={{ marginRight: 5 }} />{' '}
            {dayjs.duration(data.eta, 's').format('HH:mm')}
          </Button>
        )}
      </Tabs.Panel>
      <Tabs.Panel value="history" style={{ display: 'flex', flexDirection: 'column' }}>
        <UsenetHistoryList appId={selectedAppId} />
      </Tabs.Panel>
    </Tabs>
  );
}

export default definition;
