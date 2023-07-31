import {
  Button,
  Center,
  Divider,
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
import { useTranslation } from 'next-i18next';
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

type MovieResultsProps = z.infer<typeof queryParamsSchema> & {
  closeModal: () => void;
};

const MovieResults = ({ search, type, closeModal }: MovieResultsProps) => {
  const { name: configName } = useConfigContext();
  const { data: overseerrResults, isLoading } = api.overseerr.search.useQuery(
    {
      query: search,
      configName: configName!,
      integration: type,
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
        Found {overseerrResults?.length} results for <b>{search}</b>
      </Text>
      <Stack spacing="xs">
        {overseerrResults?.map((result, index: number) => (
          <React.Fragment key={index}>
            <MovieDisplay movie={result} type={type} closeModal={closeModal} />
            {index < overseerrResults.length - 1 && <Divider variant="dashed" my="xs" />}
          </React.Fragment>
        ))}
      </Stack>
    </Stack>
  );
};

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
      size="lg"
      scrollAreaComponent={ScrollArea.Autosize}
      title={
        <Group>
          <Image src={integration.image} width={30} height={30} alt={`${integration.label} icon`} />
          <Title order={4}>{integration.label} movies</Title>
        </Group>
      }
    >
      <MovieResults
        movie={queryParams.data.movie}
        search={queryParams.data.search}
        type={queryParams.data.type}
        closeModal={closeModal}
      />
    </Modal>
  );
};

type MovieDisplayProps = {
  movie: RouterOutputs['overseerr']['search'][number];
  type: 'jellyseerr' | 'overseerr';
  closeModal: () => void;
};

const MovieDisplay = ({ movie, type, closeModal }: MovieDisplayProps) => {
  const { t } = useTranslation('modules/common-media-cards');
  const { config } = useConfigContext();
  const [requestModalOpened, requestModal] = useDisclosure(false);

  if (!config) {
    return null;
  }

  const service = config.apps.find((service) => service.integration.type === type);

  const mediaUrl = movie.mediaInfo?.plexUrl ?? movie.mediaInfo?.mediaUrl;
  const serviceUrl = service?.behaviour.externalUrl ? service.behaviour.externalUrl : service?.url;

  return (
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
              variant="outline"
              href={mediaUrl}
              size="sm"
              rightIcon={<IconPlayerPlay size={15} />}
            >
              {t('buttons.play')}
            </Button>
          )}
          {serviceUrl && (
            <Button
              component="a"
              target="_blank"
              href={serviceUrl}
              variant="outline"
              size="sm"
              rightIcon={<IconExternalLink size={15} />}
            >
              TMDb
            </Button>
          )}
        </Group>
      </Stack>
    </Group>
  );
};
