/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Group } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPlayerPlay,
  IconPlayerStop,
  IconPlus,
  IconRefresh,
  IconRotateClockwise,
  IconTrash,
} from '@tabler/icons';
import axios from 'axios';
import Dockerode from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { TFunction } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { useConfigContext } from '../../config/provider';
import { tryMatchService } from '../../tools/addToHomarr';
import { openContextModalGeneric } from '../../tools/mantineModalManagerExtensions';
import { AppType } from '../../types/app';

let t: TFunction<'modules/docker', undefined>;

function sendDockerCommand(
  action: string,
  containerId: string,
  containerName: string,
  reload: () => void
) {
  showNotification({
    id: containerId,
    loading: true,
    title: `${t(`actions.${action}.start`)} ${containerName}`,
    message: undefined,
    autoClose: false,
    disallowClose: true,
  });
  axios
    .get(`/api/docker/container/${containerId}?action=${action}`)
    .then((res) => {
      updateNotification({
        id: containerId,
        title: containerName,
        message: `${t(`actions.${action}.end`)} ${containerName}`,
        icon: <IconCheck />,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      updateNotification({
        id: containerId,
        color: 'red',
        title: t('errors.unknownError.title'),
        message: err.response.data.reason,
        autoClose: 2000,
      });
    })
    .finally(() => {
      reload();
    });
}

export interface ContainerActionBarProps {
  selected: Dockerode.ContainerInfo[];
  reload: () => void;
}

export default function ContainerActionBar({ selected, reload }: ContainerActionBarProps) {
  t = useTranslation('modules/docker').t;
  const [isLoading, setisLoading] = useState(false);
  const { name: configName, config } = useConfigContext();
  const getLowestWrapper = () => config?.wrappers.sort((a, b) => a.position - b.position)[0];

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
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('restart', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('stop', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('start', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
          Promise.all(
            selected.map((container) =>
              sendDockerCommand('remove', container.Id, container.Names[0].substring(1), reload)
            )
          )
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
