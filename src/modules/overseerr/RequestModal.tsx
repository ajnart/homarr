import { Alert, Button, Checkbox, createStyles, Group, Modal, Stack, Table } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDownload } from '@tabler/icons';
import Consola from 'consola';
import { useTranslation } from 'next-i18next';

import { useState } from 'react';
import { useConfigContext } from '~/config/provider';
import { constructClientSecretChangesForIntegrations } from '~/server/api/helpers/apps';
import { mediaRequestIntegrationTypes } from '~/server/api/helpers/integrations';
import { api } from '~/utils/api';
import { useColorTheme } from '../../tools/color';
import { MovieResult } from './Movie.d';
import { MediaType, Result } from './SearchResult.d';
import { TvShowResult, TvShowResultSeason } from './TvShow.d';

interface RequestModalProps {
  base: Result;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export function RequestModal({ base, opened, setOpened }: RequestModalProps) {
  const { config, name } = useConfigContext();
  const app = constructClientSecretChangesForIntegrations(
    config?.apps ?? [],
    mediaRequestIntegrationTypes
  )[0];
  const { data: result } = api.overseerr.byId.useQuery(
    {
      id: base.id,
      type: base.mediaType,
      configName: name!,
      app,
    },
    {
      enabled: opened && config !== undefined && name !== undefined,
    }
  );

  if (!result || !opened) {
    return null;
  }
  return base.mediaType === 'movie' ? (
    <MovieRequestModal result={result as MovieResult} opened={opened} setOpened={setOpened} />
  ) : (
    <TvRequestModal result={result as TvShowResult} opened={opened} setOpened={setOpened} />
  );
}

export function MovieRequestModal({
  result,
  opened,
  setOpened,
}: {
  result: MovieResult;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}) {
  const { secondaryColor } = useColorTheme();
  const { t } = useTranslation('modules/overseerr');
  const askForMedia = useAskForMedia();

  return (
    <Modal
      onClose={() => setOpened(false)}
      radius="lg"
      size="lg"
      trapFocus
      zIndex={150}
      withinPortal
      opened={opened}
      title={
        <Group>
          <IconDownload />
          {t('popup.item.buttons.askFor', { title: result.title })}
        </Group>
      }
    >
      <Stack>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('popup.item.alerts.automaticApproval.title')}
          color={secondaryColor}
          radius="md"
          variant="filled"
        >
          {t('popup.item.alerts.automaticApproval.text')}
        </Alert>
        <Group>
          <Button variant="outline" color="gray" onClick={() => setOpened(false)}>
            {t('popup.item.buttons.cancel')}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              askForMedia(result.id, 'movie', result.title, []);
            }}
          >
            {t('popup.item.buttons.request')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function TvRequestModal({
  result,
  opened,
  setOpened,
}: {
  result: TvShowResult;
  opened: boolean;
  setOpened: (opened: boolean) => void;
}) {
  const [selection, setSelection] = useState<TvShowResultSeason[]>(result.seasons);
  const { classes, cx } = useStyles();
  const { t } = useTranslation('modules/overseerr');
  const askForMedia = useAskForMedia();

  const toggleRow = (container: TvShowResultSeason) =>
    setSelection((current: TvShowResultSeason[]) =>
      current.includes(container) ? current.filter((c) => c !== container) : [...current, container]
    );
  const toggleAll = () =>
    setSelection((current: any) =>
      current.length === result.seasons.length ? [] : result.seasons.map((c) => c)
    );

  const rows = result.seasons.map((element) => {
    const selected = selection.includes(element);
    return (
      <tr key={element.id} className={cx({ [classes.rowSelected]: selected })}>
        <td>
          <Checkbox
            key={element.id}
            checked={selection.includes(element)}
            onChange={() => toggleRow(element)}
            transitionDuration={0}
          />
        </td>
        <td>{element.name}</td>
        <td>{element.episodeCount}</td>
      </tr>
    );
  });
  const { secondaryColor } = useColorTheme();

  return (
    <Modal
      onClose={() => setOpened(false)}
      radius="lg"
      size="lg"
      opened={opened}
      title={
        <Group>
          <IconDownload />
          {t('popup.item.buttons.askFor', {
            title: result.name ?? result.originalName ?? 'a TV show',
          })}
        </Group>
      }
    >
      <Stack>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t('popup.item.alerts.automaticApproval.title')}
          color={secondaryColor}
          radius="md"
          variant="filled"
        >
          {t('popup.item.alerts.automaticApproval.text')}
        </Alert>
        <Table captionSide="bottom" highlightOnHover>
          <caption>{t('popup.seasonSelector.caption')}</caption>
          <thead>
            <tr>
              <th>
                <Checkbox
                  onChange={toggleAll}
                  checked={selection.length === result.seasons.length}
                  indeterminate={selection.length > 0 && selection.length !== result.seasons.length}
                  transitionDuration={0}
                />
              </th>
              <th>{t('popup.seasonSelector.table.header.season')}</th>
              <th>{t('popup.seasonSelector.table.header.numberOfEpisodes')}</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
        <Group position="center">
          <Button variant="outline" color="gray" onClick={() => setOpened(false)}>
            {t('popup.item.buttons.cancel')}
          </Button>
          <Button
            variant="outline"
            disabled={selection.length === 0}
            onClick={() => {
              askForMedia(
                result.id,
                'tv',
                result.name,
                selection.map((s) => s.seasonNumber)
              );
            }}
          >
            {t('popup.item.buttons.request')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

const useAskForMedia = () => {
  const { t } = useTranslation('modules/overseerr');
  const { mutateAsync } = api.overseerr.requestMedia.useMutation();
  const { name, config } = useConfigContext();

  // TODO: add translations for notifications!
  return async (id: number, type: MediaType, name: string, seasons?: number[]) => {
    if (!config || !name) throw new Error('Config or name is not defined');

    Consola.info(`Requesting ${type} ${id} ${name}`);
    showNotification({
      title: 'Request',
      id: id.toString(),
      message: `Requesting media ${name}`,
      color: 'orange',
      loading: true,
      autoClose: false,
      withCloseButton: false,
      icon: <IconAlertCircle />,
    });

    const app = constructClientSecretChangesForIntegrations(
      config.apps,
      mediaRequestIntegrationTypes
    )[0];

    mutateAsync(
      {
        id,
        type,
        seasons: (seasons ?? []) as number[],
        app,
        configName: name,
      },
      {
        onSuccess() {
          updateNotification({
            id: id.toString(),
            title: '',
            color: 'green',
            message: ` ${name} requested`,
            icon: <IconCheck />,
            autoClose: 2000,
          });
        },
        onError(err) {
          updateNotification({
            id: id.toString(),
            color: 'red',
            title: 'There was an error',
            message: err.message,
            autoClose: 2000,
          });
        },
      }
    );
  };
};
