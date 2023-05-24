import { ActionIcon, Drawer, Tooltip } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconBrandDocker } from '@tabler/icons-react';
import axios from 'axios';
import Docker from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCardStyles } from '../../components/layout/useCardStyles';
import { useConfigContext } from '../../config/provider';

import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { config } = useConfigContext();
  const { classes } = useCardStyles(true);

  const dockerEnabled = config?.settings.customization.layout.enabledDocker || false;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['containers'],
    queryFn: async () => {
      const containers = await axios.get('/api/docker/containers');
      return containers.data;
    },
    enabled: dockerEnabled,
  });
  useHotkeys([['mod+B', () => setOpened(!opened)]]);

  const { t } = useTranslation('modules/docker');

  useEffect(() => {
    refetch();
  }, [config?.settings]);

  const reload = () => {
    refetch();
    setSelection([]);
  };

  return (
    <>
      <Drawer
        opened={opened}
        trapFocus={false}
        onClose={() => setOpened(false)}
        padding="xl"
        position="right"
        size="100%"
        title={<ContainerActionBar selected={selection} reload={reload} />}
        transitionProps={{
          transition: 'pop',
        }}
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
          },
          body: {
            minHeight: 0,
          },
        }}
      >
        <DockerTable containers={data} selection={selection} setSelection={setSelection} />
      </Drawer>
      <Tooltip label={t('actionIcon.tooltip')}>
        <ActionIcon
          variant="default"
          className={classes.card}
          radius="md"
          size="xl"
          color="blue"
          onClick={() => setOpened(true)}
        >
          <IconBrandDocker />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
