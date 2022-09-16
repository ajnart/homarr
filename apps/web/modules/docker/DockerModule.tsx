import { ActionIcon, Drawer, Tooltip } from '@mantine/core';
import React, { useState } from 'react';
import { IconBrandDocker } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import { useGetContainersQuery } from '@homarr/graphql';
import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';
import { useConfig } from '../../lib/state';
import { IModule } from '../ModuleTypes';

export const DockerModule: IModule = {
  title: 'Docker',
  icon: IconBrandDocker,
  component: DockerMenuButton,
  id: 'docker',
  dataKey: 'docker',
};

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const { config } = useConfig();
  const [selection, setSelection] = useState<string[]>([]);
  const moduleEnabled = config.modules?.[DockerModule.id]?.enabled ?? false;

  const { data, refetch } = useGetContainersQuery();

  const { t } = useTranslation('modules/docker');

  if (!moduleEnabled) {
    return null;
  }
  // Check if the user has at least one container
  if (!data || data.containers.length < 1) return null;
  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="xl"
        size="full"
        title={<ContainerActionBar selected={selection} reload={refetch} />}
      >
        <DockerTable
          containers={data.containers}
          selection={selection}
          setSelection={setSelection}
        />
      </Drawer>
      <Tooltip label={t('actionIcon.tooltip')}>
        <ActionIcon
          variant="default"
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
