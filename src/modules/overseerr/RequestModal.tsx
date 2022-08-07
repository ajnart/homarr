import { Alert, Checkbox, createStyles, Group, LoadingOverlay, Stack, Table } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDownload } from '@tabler/icons';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useColorTheme } from '../../tools/color';
import { MovieResult } from './Movie.d';
import { MediaType, Result } from './SearchResult.d';
import { TvShowResult, TvShowResultSeason } from './TvShow.d';

interface RequestModalProps {
  base: Result;
}

const useStyles = createStyles((theme) => ({
  rowSelected: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.fn.rgba(theme.colors[theme.primaryColor][7], 0.2)
        : theme.colors[theme.primaryColor][0],
  },
}));

export default function RequestModal({ base }: RequestModalProps) {
  const [result, setResult] = useState<MovieResult | TvShowResult>();

  useEffect(() => {
    // Use the overseerr API get the media info.
    axios.get(`/api/modules/overseerr/${base.id}?type=${base.mediaType}`).then((res) => {
      setResult(res.data);
    });
  }, [base]);

  const { secondaryColor } = useColorTheme();
  if (!result) {
    return <LoadingOverlay color={secondaryColor} visible />;
  }
  return base.mediaType === 'movie' ? (
    <MovieRequestModal result={result as MovieResult} />
  ) : (
    <TvRequestModal result={result as TvShowResult} />
  );
}

function MovieRequestModal({ result }: { result: MovieResult }) {
  const { secondaryColor } = useColorTheme();
  openConfirmModal({
    title: (
      <Group>
        <IconDownload />
        Ask for {result.title}
      </Group>
    ),
    radius: 'lg',
    labels: { confirm: 'Request', cancel: 'Cancel' },
    onConfirm: () => {
      askForMedia(MediaType.Movie, result.id, result.title);
    },
    size: 'lg',
    children: (
      <Stack>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Using API key"
          color={secondaryColor}
          radius="md"
          variant="filled"
        >
          This request will be automatically approved
        </Alert>
      </Stack>
    ),
  });
  return null;
}

function TvRequestModal({ result }: { result: TvShowResult }) {
  const [selection, setSelection] = useState<TvShowResultSeason[]>(result.seasons);
  const { classes, cx } = useStyles();

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

  openConfirmModal({
    title: (
      <Group>
        <IconDownload />
        Ask for {result.name}
      </Group>
    ),
    radius: 'lg',
    labels: { confirm: 'Request', cancel: 'Cancel' },
    confirmProps: {
      disabled: selection.length === 0,
    },
    onConfirm: () => {
      askForMedia(
        MediaType.Tv,
        result.id,
        result.name,
        selection.map((s) => s.seasonNumber)
      );
    },
    size: 'lg',
    children: (
      <Stack>
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Using API key"
          color={secondaryColor}
          radius="md"
          variant="filled"
        >
          This request will be automatically approved
        </Alert>
        <Table captionSide="bottom" highlightOnHover>
          <caption>Tick the seasons that you want to be downloaded</caption>
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
              <th>Season</th>
              <th>Number of episodes</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Stack>
    ),
  });
  return null;
}

function askForMedia(type: MediaType, id: number, name: string, seasons?: number[]) {
  showNotification({
    title: 'Request',
    id: id.toString(),
    message: `Requesting media ${name}`,
    color: 'orange',
    loading: true,
    autoClose: false,
    disallowClose: true,
    icon: <IconAlertCircle />,
  });
  axios
    .post(`/api/modules/overseerr/${id}`, { type, seasons })
    .then(() => {
      updateNotification({
        id: id.toString(),
        title: '',
        color: 'green',
        message: ` ${name} requested`,
        icon: <IconCheck />,
        autoClose: 2000,
      });
    })
    .catch((err) => {
      updateNotification({
        id: id.toString(),
        color: 'red',
        title: 'There was an error',
        message: err.message,
        autoClose: 2000,
      });
    });
}
