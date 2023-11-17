import { Badge, Button, Group, Select, Stack, Tabs, Text, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconFileDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useRequiredBoard } from '~/components/Board/context';
import { MIN_WIDTH_MOBILE } from '~/constants/constants';
import { humanFileSize } from '~/tools/humanFileSize';

import { defineWidget } from '../helper';
import { InferWidget } from '../widgets';
import { UsenetHistoryList } from './UsenetHistoryList';
import { UsenetQueueList } from './UsenetQueueList';
import { useGetUsenetInfo, usePauseUsenetQueueMutation, useResumeUsenetQueueMutation } from './api';

dayjs.extend(duration);

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

export type IUsenetWidget = InferWidget<typeof definition>;

interface UseNetTileProps {
  widget: IUsenetWidget;
}

function UseNetTile({ widget }: UseNetTileProps) {
  const { id: boardId } = useRequiredBoard();
  const { t } = useTranslation('modules/usenet');
  const { ref, width } = useElementSize();
  const { data: sessionData } = useSession();
  const [integrationId, setIntegrationId] = useState(widget.integrations[0]?.id);

  const { data } = useGetUsenetInfo({ integrationId });

  const pauseAsync = usePauseUsenetQueueMutation();
  const resumeAsync = useResumeUsenetQueueMutation();

  if (!integrationId) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noDownloadClients.title')}</Title>
        <Group>
          <Text>{t('card.errors.noDownloadClients.text')}</Text>
        </Group>
      </Stack>
    );
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
      {widget.integrations.length > 1 && (
        <Select
          value={integrationId}
          onChange={(v) => v && setIntegrationId(v)}
          ml="xs"
          data={widget.integrations.map(({ id, name }) => ({ value: id, label: name }))}
        />
      )}
      <Tabs.Panel value="queue">
        <UsenetQueueList integrationId={integrationId} />
        {sessionData?.user?.isAdmin &&
          (!data ? null : data.paused ? (
            <Button
              uppercase
              onClick={async () => resumeAsync({ integrationId })}
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
              onClick={async () => pauseAsync({ integrationId })}
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
        <UsenetHistoryList integrationId={integrationId} />
      </Tabs.Panel>
    </Tabs>
  );
}

export default definition;
