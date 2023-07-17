/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { MatchingImages, ServiceType, tryMatchPort } from '../../tools/types';
import { AppType } from '../../types/app';

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  const { t } = useTranslation('modules/docker');
  const [isLoading, setisLoading] = useState(false);
  const { config } = useConfigContext();
  const getLowestWrapper = () => config?.wrappers.sort((a, b) => a.position - b.position)[0];
  const sendDockerCommand = useDockerActionMutation();

  if (process.env.DISABLE_EDIT_MODE === 'true') {
    return null;
  }

  return (
    <Group spacing="xs">
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
          Promise.all(selected.map((container) => sendDockerCommand(container, 'restart')))
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
        onClick={() =>
          Promise.all(selected.map((container) => sendDockerCommand(container, 'stop')))
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
        onClick={() =>
          Promise.all(selected.map((container) => sendDockerCommand(container, 'start')))
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
        onClick={() =>
          Promise.all(selected.map((container) => sendDockerCommand(container, 'remove')))
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
        disabled={selected.length === 0 || selected.length > 1}
        onClick={() => {
          const app = tryMatchService(selected.at(0)!);
          const containerUrl = `http://localhost:${selected[0].Ports[0]?.PublicPort ?? 0}`;
          openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
            modal: 'editApp',
            zIndex: 202,
            innerProps: {
              app: {
                id: uuidv4(),
                name: app.name ? app.name : selected[0].Names[0].substring(1),
                url: containerUrl,
                appearance: {
                  iconUrl: app.icon ? app.icon : '/imgs/logo/logo.png',
                },
                network: {
                  enabledStatusChecker: true,
                  statusCodes: ['200'],
                  okStatus: [200],
                },
                behaviour: {
                  isOpeningNewTab: true,
                  externalUrl: '',
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

/**
 * @deprecated legacy code
 */
function tryMatchType(imageName: string): ServiceType {
  const match = MatchingImages.find(({ image }) => imageName.includes(image));
  if (match) {
    return match.type;
  }
  // TODO: Remove this legacy code
  return 'Other';
}

/**
 * @deprecated
 * @param container the container to match
 * @returns a new service
 */
const tryMatchService = (container: Dockerode.ContainerInfo | undefined) => {
  if (container === undefined) return {};
  const name = container.Names[0].substring(1);
  const type = tryMatchType(container.Image);
  const port = tryMatchPort(type.toLowerCase())?.value ?? container.Ports[0]?.PublicPort;
  return {
    name,
    id: container.Id,
    type: tryMatchType(container.Image),
    url: `localhost${port ? `:${port}` : ''}`,
    icon: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`,
  };
};
