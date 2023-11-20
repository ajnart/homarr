import { Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons-react';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';
import { RouterInputs, api } from '~/utils/api';

import { openDockerSelectBoardModal } from './docker-select-board.modal';

export interface ContainerActionBarProps {
  selected: (Dockerode.ContainerInfo & { icon?: string })[];
  reload: () => void;
  isLoading: boolean;
}

export default function ContainerActionBar({
  selected,
  reload,
  isLoading,
}: ContainerActionBarProps) {
  const { t } = useTranslation('modules/docker');
  const sendDockerCommand = useDockerActionMutation();

  return (
    <Group spacing="xs">
      <Button
        leftIcon={<IconRefresh />}
        onClick={reload}
        variant="light"
        color="violet"
        loading={isLoading}
        radius="md"
      >
        {t('actionBar.refreshData.title')}
      </Button>
      <Button
        leftIcon={<IconRotateClockwise />}
        onClick={async () =>
          await Promise.all(selected.map((container) => sendDockerCommand(container, 'restart')))
        }
        variant="light"
        color="orange"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.restart.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerStop />}
        onClick={async () =>
          await Promise.all(selected.map((container) => sendDockerCommand(container, 'stop')))
        }
        variant="light"
        color="red"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.stop.title')}
      </Button>
      <Button
        leftIcon={<IconPlayerPlay />}
        onClick={async () =>
          await Promise.all(selected.map((container) => sendDockerCommand(container, 'start')))
        }
        variant="light"
        color="green"
        radius="md"
        disabled={selected.length === 0}
      >
        {t('actionBar.start.title')}
      </Button>
      <Button
        leftIcon={<IconTrash />}
        color="red"
        variant="light"
        radius="md"
        onClick={async () =>
          await Promise.all(selected.map((container) => sendDockerCommand(container, 'remove')))
        }
        disabled={selected.length === 0}
      >
        {t('actionBar.remove.title')}
      </Button>
      <Button
        leftIcon={<IconPlus />}
        color="indigo"
        variant="light"
        radius="md"
        disabled={selected.length < 1}
        onClick={() => openDockerSelectBoardModal({ containers: selected })}
      >
        {t('actionBar.addToHomarr.title')}
      </Button>
    </Group>
  );
}

const useDockerActionMutation = () => {
  const { t } = useTranslation('modules/docker');
  const utils = api.useContext();
  const mutation = api.docker.action.useMutation();

  return async (
    container: Dockerode.ContainerInfo,
    action: RouterInputs['docker']['action']['action']
  ) => {
    const containerName = container.Names[0].substring(1);

    notifications.show({
      id: container.Id,
      loading: true,
      title: `${t(`actions.${action}.start`)} ${containerName}`,
      message: undefined,
      autoClose: false,
      withCloseButton: false,
    });

    await mutation.mutateAsync(
      { action, id: container.Id },
      {
        onSuccess: () => {
          notifications.cleanQueue();
        },
        onError: (err) => {
          notifications.update({
            id: container.Id,
            color: 'red',
            title: t('errors.unknownError.title'),
            message: err.message,
            autoClose: 2000,
          });
        },
        onSettled: () => {
          utils.docker.containers.invalidate();
        },
      }
    );
  };
};
