/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DockerAction, useUpdateContainersMutation } from '@homarr/graphql';
import { Button, Group } from '@mantine/core';
import { closeModal, openModal } from '@mantine/modals';
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { TFunction } from 'react-i18next';
import { AddAppShelfItemForm } from '../../components/AppShelf/AddAppShelfItem';
import { useConfig } from '../../lib/state';

let t: TFunction<'modules/docker', undefined>;

export interface ContainerActionBarProps {
  selected: string[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  t = useTranslation('modules/docker').t;
  const [isLoading, setisLoading] = useState(false);
  const { config, setConfig } = useConfig();
  const [updateContainers, { loading }] = useUpdateContainersMutation();

  return (
    <Group>
      <Button
        leftIcon={<IconRefresh />}
        onClick={() => {
          setisLoading(true);
          setTimeout(() => {
            reload();
            setisLoading(false);
          }, 750);
        }}
        variant="light"
        color="violet"
        loading={isLoading}
        radius="md"
      >
        {t('actionBar.refreshData.title')}
      </Button>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={() =>
          updateContainers({
            variables: {
              ids: selected,
              action: DockerAction.Restart,
            },
          })
        }
        variant="light"
        color="orange"
        radius="md"
        disabled={selected.length === 0}
        loading={loading}
      >
        {t('actionBar.restart.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerStop />}
        onClick={() =>
          updateContainers({
            variables: {
              ids: selected,
              action: DockerAction.Stop,
            },
          })
        }
        variant="light"
        color="red"
        radius="md"
        disabled={selected.length === 0}
        loading={loading}
      >
        {t('actionBar.stop.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerPlay />}
        onClick={() =>
          updateContainers({
            variables: {
              ids: selected,
              action: DockerAction.Start,
            },
          })
        }
        variant="light"
        color="green"
        radius="md"
        disabled={selected.length === 0}
        loading={loading}
      >
        {t('actionBar.start.title')}
      </Button>
      <Button
        leftIcon={<IconTrash />}
        color="red"
        variant="light"
        radius="md"
        onClick={() =>
          updateContainers({
            variables: {
              ids: selected,
              action: DockerAction.Remove,
            },
          })
        }
        disabled={selected.length === 0}
        loading={loading}
      >
        {t('actionBar.remove.title')}
      </Button>
      <Button
        leftIcon={<IconPlus />}
        color="indigo"
        variant="light"
        radius="md"
        disabled={selected.length === 0 || selected.length > 1}
        onClick={() => {
          openModal({
            size: 'xl',
            modalId: selected[0],
            radius: 'md',
            title: t('actionBar.addService.title'),
            zIndex: 500,
            children: (
              <AddAppShelfItemForm
                setConfig={setConfig}
                config={config}
                setOpened={() => closeModal(selected[0])}
                message={t('actionBar.addService.message')}
                // {...tryMatchService(selected[0])}
              />
            ),
          });
        }}
      >
        {t('actionBar.addToHomarr.title')}
      </Button>
    </Group>
  );
}
