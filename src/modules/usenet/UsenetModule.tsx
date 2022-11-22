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
import { IconDownload, IconPlayerPause, IconPlayerPlay } from '@tabler/icons';
import { FunctionComponent, useEffect, useState } from 'react';

import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useElementSize } from '@mantine/hooks';
import { IModule } from '../ModuleTypes';
import { UsenetQueueList } from './UsenetQueueList';
import { UsenetHistoryList } from './UsenetHistoryList';
import { useGetServiceByType } from '../../tools/hooks/useGetServiceByType';
import { useGetUsenetInfo, usePauseUsenetQueue, useResumeUsenetQueue } from '../../tools/hooks/api';
import { humanFileSize } from '../../tools/humanFileSize';
import { AddItemShelfButton } from '../../components/AppShelf/AddAppShelfItem';

dayjs.extend(duration);

export const UsenetComponent: FunctionComponent = () => {
  const downloadServices = useGetServiceByType('Sabnzbd', 'NZBGet');

  const { t } = useTranslation('modules/usenet');

  const [selectedServiceId, setSelectedService] = useState<string | null>(downloadServices[0]?.id);
  const { data } = useGetUsenetInfo({ serviceId: selectedServiceId! });

  useEffect(() => {
    if (!selectedServiceId && downloadServices.length) {
      setSelectedService(downloadServices[0].id);
    }
  }, [downloadServices, selectedServiceId]);

  const { mutate: pause } = usePauseUsenetQueue({ serviceId: selectedServiceId! });
  const { mutate: resume } = useResumeUsenetQueue({ serviceId: selectedServiceId! });

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

  const { ref, width, height } = useElementSize();
  const MIN_WIDTH_MOBILE = useMantineTheme().breakpoints.xs;

  return (
    <Tabs keepMounted={false} defaultValue="queue">
      <Tabs.List ref={ref} mb="md" style={{ flex: 1 }}>
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

            {data.paused ? (
              <Button uppercase onClick={() => resume()} radius="xl" size="xs">
                <IconPlayerPlay size={12} style={{ marginRight: 5 }} /> {t('info.paused')}
              </Button>
            ) : (
              <Button uppercase onClick={() => pause()} radius="xl" size="xs">
                <IconPlayerPause size={12} style={{ marginRight: 5 }} />{' '}
                {dayjs.duration(data.eta, 's').format('HH:mm')}
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
};

export default UsenetComponent;
