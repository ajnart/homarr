import { IconArrowsMaximize, IconBrandDocker } from '@tabler/icons';
import { useState } from 'react';
import axios from 'axios';
import Docker from 'dockerode';
import { useQuery } from '@tanstack/react-query';
import { ActionIcon, Drawer, Loader, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useHotkeys } from '@mantine/hooks';
import { IWidget } from '../widgets';
import { defineWidget } from '../helper';
import DockerTable from '../../modules/Docker/DockerTable';
import ContainerActionBar from '../../modules/Docker/ContainerActionBar';
import { useEditModeStore } from '../../components/Dashboard/Views/useEditModeStore';

const definition = defineWidget({
  id: 'docker',
  icon: IconBrandDocker,
  options: {
    hideSearchBar: {
      type: 'switch',
      defaultValue: false,
    },
  },

  gridstack: {
    minWidth: 2,
    minHeight: 1,
    maxWidth: 12,
    maxHeight: 6,
  },
  component: DockerWidgetTable,
});

export type IDockerWidget = IWidget<(typeof definition)['id'], typeof definition>;

interface DockerTileProps {
  widget: IDockerWidget;
}

export default definition;

export function DockerWidgetTable({ widget }: DockerTileProps) {
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { hideSearchBar } = widget.properties;
  const { t } = useTranslation('modules/docker');
  const [opened, setOpened] = useState(false);
  useHotkeys([['mod+B', () => setOpened(!opened)]]);
  const isEditMode = useEditModeStore((x) => x.enabled);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['docker'],
    queryFn: () => axios.get('/api/docker/containers', { timeout: 2000 }),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  });
  if (isLoading) {
    return (
      <Stack
        align="center"
        justify="center"
        style={{
          height: '100%',
        }}
      >
        <Loader variant="bars" />
        <Stack align="center" spacing={0}>
          <Text color="dimmed">Loading your docker containers...</Text>
        </Stack>
      </Stack>
    );
  }
  if (!data || error) {
    return (
      <Stack style={{ height: '100%' }} align="center" justify="center">
        <Title order={3}>{t('errors.integrationFailed.title')}</Title>
        <Text>{t('errors.integrationFailed.message')}</Text>
      </Stack>
    );
  }
  return (
    <>
      <Drawer
        opened={opened}
        trapFocus={false}
        onClose={() => setOpened(false)}
        padding="xl"
        position="right"
        size="full"
        transition="pop"
        title={
          <ContainerActionBar
            selected={selection}
            reload={() => {
              refetch();
              setSelection([]);
            }}
          />
        }
        styles={{
          drawer: {
            display: 'flex',
            flexDirection: 'column',
          },
          body: {
            minHeight: 0,
          },
        }}
      >
        <DockerTable
          hideSearchBar={false}
          widgetMode={false}
          containers={data.data}
          selection={selection}
          setSelection={setSelection}
        />
      </Drawer>
      <DockerTable
        containers={data.data}
        selection={[]}
        setSelection={setSelection}
        hideSearchBar={hideSearchBar}
        widgetMode
      />
      {!isEditMode && (
        <ActionIcon
          size="md"
          radius="md"
          variant="light"
          pos="absolute"
          top={8}
          right={8}
          onClick={() => setOpened(true)}
        >
          <IconArrowsMaximize />
        </ActionIcon>
      )}
    </>
  );
}
