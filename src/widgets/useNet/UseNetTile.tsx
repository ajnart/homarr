import { Badge, Button, Group, Select, Stack, Tabs, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfigContext } from '~/config/provider';
import { MIN_WIDTH_MOBILE } from '~/constants/constants';
import { humanFileSize } from '~/tools/humanFileSize';
import { AppIntegrationType } from '~/types/app';

import {
  useGetUsenetInfo,
  usePauseUsenetQueueMutation,
  useResumeUsenetQueueMutation,
} from '../dashDot/api';
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
    minWidth: 2,
    minHeight: 3,
    maxWidth: 12,
    maxHeight: 12,
  },
});

export type IUsenetWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface UseNetTileProps {
  widget: IUsenetWidget;
}

function UseNetTile({ widget }: UseNetTileProps) {
  const { t } = useTranslation('modules/usenet');
  const { config } = useConfigContext();
  const downloadApps =
    config?.apps.filter((x) => x.integration && downloadAppTypes.includes(x.integration.type)) ??
    [];
  const { ref, width } = useElementSize();
  const { data: sessionData } = useSession();

  const [selectedAppId, setSelectedApp] = useState<string | null>(downloadApps[0]?.id);
  const { data } = useGetUsenetInfo({ appId: selectedAppId! });

  useEffect(() => {
    if (!selectedAppId && downloadApps.length) {
      setSelectedApp(downloadApps[0].id);
    }
  }, [downloadApps, selectedAppId]);

  const pauseAsync = usePauseUsenetQueueMutation({ appId: selectedAppId! });
  const resumeAsync = useResumeUsenetQueueMutation({ appId: selectedAppId! });

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
        {sessionData?.user?.isAdmin &&
          (!data ? null : data.paused ? (
            <Button
              uppercase
              onClick={async () => resumeAsync({ appId: selectedAppId })}
              radius="xl"
              size="xs"
              fullWidth
              mt="sm"
            >
              <IconPlayerPlay size={12} style={{ marginRight: 5 }} /> {t('info.paused')}
            </Button>
          ) : (
            <Button
              uppercase
              onClick={async () => pauseAsync({ appId: selectedAppId })}
              radius="xl"
              size="xs"
              fullWidth
              mt="sm"
            >
              <IconPlayerPause size={12} style={{ marginRight: 5 }} />{' '}
              {dayjs.duration(data.eta, 's').format('HH:mm')}
            </Button>
          ))}
      </Tabs.Panel>
      <Tabs.Panel value="history" style={{ display: 'flex', flexDirection: 'column' }}>
        <UsenetHistoryList appId={selectedAppId} />
      </Tabs.Panel>
    </Tabs>
  );
}

export default definition;
