import {
  Button,
  Card,
  Center,
  Grid,
  Group,
  Loader,
  Image as MantineImage,
  Modal,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDownload, IconExternalLink, IconPlayerPlay } from '@tabler/icons-react';
import { Trans, useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { z } from 'zod';
import { availableIntegrations } from '~/components/Dashboard/Modals/EditAppModal/Tabs/IntegrationTab/Components/InputElements/IntegrationSelector';
import { useConfigContext } from '~/config/provider';
import { RequestModal } from '~/modules/overseerr/RequestModal';
import { RouterOutputs, api } from '~/utils/api';

type MovieModalProps = {
  opened: boolean;
  closeModal: () => void;
};

const queryParamsSchema = z.object({
  movie: z.literal('true'),
  search: z.string().nonempty(),
  type: z.enum(['jellyseerr', 'overseerr']),
});

export const MovieModal = ({ opened, closeModal }: MovieModalProps) => {
  const query = useRouter().query;
  const queryParams = queryParamsSchema.safeParse(query);

  if (!queryParams.success) {
    return null;
  }

  const integration = useMemo(() => {
    return availableIntegrations.find((x) => x.value === queryParams.data.type)!;
  }, [queryParams.data.type]);

  return (
    <Modal
      opened={opened}
      onClose={closeModal}
      size="100%"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group>
          <Image src={integration.image} width={30} height={30} alt={`${integration.label} icon`} />
          <Title order={4}>{integration.label} search</Title>
        </Group>
      }
    >
      <MovieResults search={queryParams.data.search} type={queryParams.data.type} />
    </Modal>
  );
};

type MovieResultsProps = Omit<z.infer<typeof queryParamsSchema>, 'movie'>;

const MovieResults = ({ search, type }: MovieResultsProps) => {
  const { t } = useTranslation('layout/header');
  const { name: configName } = useConfigContext();
  const { data: movies, isLoading } = api.overseerr.search.useQuery(
    {
      query: search,
      configName: configName!,
      integration: type,
      limit: 12,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchInterval: false,
    }
  );

  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );

  return (
    <Stack>
      <Text>
        <Trans
          t={t}
          i18nKey="modals.movie.topResults"
          values={{
            count: movies?.length ?? 0,
            search,
          }}
          components={{
            b: <b />,
          }}
        />
      </Text>
      <Grid gutter={32}>
        {movies?.map((result, index: number) => (
          <Grid.Col key={index} span={12} sm={6} lg={4}>
            <MovieDisplay movie={result} type={type} />
          </Grid.Col>
        ))}
      </Grid>
    </Stack>
  );
};

type MovieDisplayProps = {
  movie: RouterOutputs['overseerr']['search'][number];
  type: 'jellyseerr' | 'overseerr';
};

const MovieDisplay = ({ movie, type }: MovieDisplayProps) => {
  const { t } = useTranslation('modules/common-media-cards');
  const { config } = useConfigContext();
  const [requestModalOpened, requestModal] = useDisclosure(false);

  if (!config) {
    return null;
  }

  const service = config.apps.find((service) => service.integration.type === type);
  const mediaUrl = movie.mediaInfo?.plexUrl ?? movie.mediaInfo?.mediaUrl;
  const serviceUrl = service?.behaviour.externalUrl ?? service?.url;
  const externalUrl = new URL(
    `${movie.mediaType}/${movie.id}`,
    serviceUrl ?? 'https://www.themoviedb.org'
  );

  return (
    <Card withBorder>
      <Group noWrap style={{ maxHeight: 250 }} p={0} m={0} spacing="xs" align="stretch">
        <MantineImage
          withPlaceholder
          src={`https://image.tmdb.org/t/p/w600_and_h900_bestv2/${
            movie.posterPath ?? movie.backdropPath
          }`}
          height={200}
          width={150}
          radius="md"
          fit="cover"
        />
        <Stack justify="space-between">
          <Stack spacing={4}>
            <Title lineClamp={2} order={5}>
              {movie.title ?? movie.name ?? movie.originalName}
            </Title>
            <Text color="dimmed" size="xs" lineClamp={4}>
              {movie.overview}
            </Text>
          </Stack>

          <Group spacing="xs">
            {!movie.mediaInfo?.mediaAddedAt && (
              <>
                <RequestModal
                  base={movie}
                  opened={requestModalOpened}
                  setOpened={requestModal.toggle}
                />
                <Button
                  onClick={() => {
                    requestModal.open();
                  }}
                  variant="light"
                  size="sm"
                  rightIcon={<IconDownload size={15} />}
                >
                  {t('buttons.request')}
                </Button>
              </>
            )}
            {mediaUrl && (
              <Button
                component="a"
                target="_blank"
                variant="light"
                href={mediaUrl}
                size="sm"
                rightIcon={<IconPlayerPlay size={15} />}
              >
                {t('buttons.play')}
              </Button>
            )}
            {externalUrl && (
              <Button
                component="a"
                target="_blank"
                href={externalUrl.href}
                variant="outline"
                size="sm"
                rightIcon={<IconExternalLink size={15} />}
              >
                {serviceUrl ? (type === 'jellyseerr' ? 'Jellyfin' : 'Overseerr') : 'TMDB'}
              </Button>
            )}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
};
