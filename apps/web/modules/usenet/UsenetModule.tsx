import { Badge, Button, Group, Select, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { FunctionComponent, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {
  GetUsenetInfoDocument,
  GetUsenetInfoQuery,
  GetUsenetInfoQueryVariables,
  useGetUsenetInfoQuery,
  usePauseUsenetQueueMutation,
  useResumeUsenetQueueMutation,
} from '@homarr/graphql';
import { IModule } from '../ModuleTypes';
import { UsenetQueueList } from './UsenetQueueList';
import { UsenetHistoryList } from './UsenetHistoryList';
import { useGetServiceByType } from '../../lib/hooks/useGetServiceByType';
import { humanFileSize } from '../../lib/humanFileSize';
import { AddItemShelfButton } from '../../components/AppShelf/AddAppShelfItem';

dayjs.extend(duration);

export const UsenetComponent: FunctionComponent = () => {
  const downloadServices = useGetServiceByType('Sabnzbd');

  const { t } = useTranslation('modules/usenet');

  const [selectedServiceId, setSelectedService] = useState<string | null>(downloadServices[0]?.id);

  const { data } = useGetUsenetInfoQuery({
    variables: { serviceId: selectedServiceId! },
  });

  useEffect(() => {
    if (!selectedServiceId && downloadServices.length) {
      setSelectedService(downloadServices[0].id);
    }
  }, [downloadServices, selectedServiceId]);

  const [pause] = usePauseUsenetQueueMutation({
    variables: { serviceId: selectedServiceId! },
    update(cache, { data }) {
      if (data) {
        cache.writeQuery<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>({
          query: GetUsenetInfoDocument,
          variables: { serviceId: selectedServiceId! },
          data: {
            usenetInfo: data.pauseUsenetQueue,
          },
        });
      }
    },
  });
  const [resume] = useResumeUsenetQueueMutation({
    variables: { serviceId: selectedServiceId! },
    update(cache, { data }) {
      if (data) {
        cache.writeQuery<GetUsenetInfoQuery, GetUsenetInfoQueryVariables>({
          query: GetUsenetInfoDocument,
          variables: { serviceId: selectedServiceId! },
          data: {
            usenetInfo: data.resumeUsenetQueue,
          },
        });
      }
    },
  });

  if (downloadServices.length === 0) {
    return (
      <Stack>
        <Title order={3}>{t('card.errors.noDownloadClients.title')}</Title>
        <Group>
          <Text>{t('card.errors.noDownloadClients.text')}</Text>
          <AddItemShelfButton />
        </Group>
      </Stack>
    );
  }

  if (!selectedServiceId) {
    return null;
  }

  return (
    <Tabs keepMounted={false} defaultValue="queue">
      <Group mb="md">
        <Tabs.List style={{ flex: 1 }}>
          <Tabs.Tab value="queue">{t('tabs.queue')}</Tabs.Tab>
          <Tabs.Tab value="history">{t('tabs.history')}</Tabs.Tab>
          {data && (
            <Group position="right" ml="auto" mb="lg">
              <Badge>{humanFileSize(data?.usenetInfo.speed)}/s</Badge>
              <Badge>
                {t('info.sizeLeft')}: {humanFileSize(data?.usenetInfo.sizeLeft)}
              </Badge>
              {data.usenetInfo.paused ? (
                <Button onClick={() => resume()} uppercase radius="xl" size="xs">
                  <IconPlayerPlay size={16} style={{ marginRight: 5 }} /> {t('info.paused')}
                </Button>
              ) : (
                <Button onClick={() => pause()} uppercase radius="xl" size="xs">
                  <IconPlayerPause size={16} style={{ marginRight: 5 }} />{' '}
                  {dayjs.duration(data.usenetInfo.eta, 's').format('HH:mm:ss')}
                </Button>
              )}
            </Group>
          )}
        </Tabs.List>
        {downloadServices.length > 1 && (
          <Select
            value={selectedServiceId}
            onChange={setSelectedService}
            ml="xs"
            data={downloadServices.map((service) => ({ value: service.id, label: service.name }))}
          />
        )}
      </Group>
      <Tabs.Panel value="queue">
        <UsenetQueueList serviceId={selectedServiceId} />
      </Tabs.Panel>
      <Tabs.Panel value="history">
        <UsenetHistoryList serviceId={selectedServiceId} />
      </Tabs.Panel>
    </Tabs>
  );
};

export const UsenetModule: IModule = {
  id: 'usenet',
  title: 'Usenet',
  icon: IconDownload,
  component: UsenetComponent,
  dataKey: 'usenet',
};

export default UsenetComponent;
