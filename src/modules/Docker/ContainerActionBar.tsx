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
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { RouterInputs, api } from '~/utils/api';

import { useConfigContext } from '../../config/provider';
import { openContextModalGeneric } from '../../tools/mantineModalManagerExtensions';
import { AppType } from '../../types/app';

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  const { t } = useTranslation('modules/docker');
  const [isLoading, setLoading] = useState(false);
  const { config } = useConfigContext();

  const sendDockerCommand = useDockerActionMutation();
  if (!config) {
    return null;
  }
  const getLowestWrapper = () =>
    config.wrappers.sort((wrapper1, wrapper2) => wrapper1.position - wrapper2.position)[0];

  if (process.env.DISABLE_EDIT_MODE === 'true') {
    return null;
  }

  return (
    <Group spacing="xs">
      <Button
        leftIcon={<IconRefresh />}
        onClick={() => {
          setLoading(true);
          setTimeout(() => {
            reload();
            setLoading(false);
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
        disabled={selected.length !== 1}
        onClick={() => {
          const containerInfo = selected[0];

          const port = containerInfo.Ports.at(0)?.PublicPort;
          const address = port ? `http://localhost:${port}` : `http://localhost`;
          const name = containerInfo.Names.at(0) ?? 'App';

          openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
            modal: 'editApp',
            zIndex: 202,
            innerProps: {
              app: {
                id: uuidv4(),
                name: name,
                url: address,
                appearance: {
                  iconUrl: '/imgs/logo/logo.png',
                },
                network: {
                  enabledStatusChecker: true,
                  statusCodes: ['200', '301', '302']
                },
                behaviour: {
                  isOpeningNewTab: true,
                  externalUrl: address
                },
                area: {
                  type: 'wrapper',
                  properties: {
                    id: getLowestWrapper()?.id ?? 'default',
                  },
                },
                shape: {},
                integration: {
                  type: null,
                  properties: [],
                },
              },
              allowAppNamePropagation: true,
            },
            size: 'xl',
          });
        }}
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
          notifications.show({
            id: container.Id,
            title: containerName,
            message: `${t(`actions.${action}.end`)} ${containerName}`,
            icon: <IconCheck />,
            autoClose: 2000,
          });
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
