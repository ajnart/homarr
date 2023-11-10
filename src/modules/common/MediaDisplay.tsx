import { Badge, Button, Group, Image, Stack, Text, Title } from '@mantine/core';
import { IconDownload, IconExternalLink, IconPlayerPlay } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '~/config/provider';
import { useColorTheme } from '~/tools/color';

import { RequestModal } from '../overseerr/RequestModal';
import { Result } from '../overseerr/SearchResult';

export interface IMedia {
  overview: string;
  imdbId?: any;
  tmdbId?: any;
  artist?: string;
  title?: string;
  type: 'movie' | 'tvshow' | 'book' | 'music' | 'overseer';
  episodetitle?: string;
  voteAverage?: string;
  poster?: string;
  altPoster?: string;
  genres: string[];
  seasonNumber?: number;
  plexUrl?: string;
  episodeNumber?: number;
  [key: string]: any;
}

export function OverseerrMediaDisplay(props: any) {
  const { media }: { media: Result } = props;
  const { config } = useConfigContext();

  if (!config) {
    return null;
  }

  const service = config.apps.find(
    (service) =>
      service.integration.type === 'overseerr' || service.integration.type === 'jellyseerr'
  );

  return (
    <MediaDisplay
      media={{
        ...media,
        genres: [],
        overview: media.overview ?? '',
        title: media.title ?? media.name ?? media.originalName,
        poster: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${media.posterPath}`,
        seasonNumber: media.mediaInfo?.seasons.length,
        episodetitle: media.title,
        plexUrl: media.mediaInfo?.plexUrl ?? media.mediaInfo?.mediaUrl,
        voteAverage: media.voteAverage?.toString(),
        overseerrResult: media,
        overseerrId: `${
          service?.behaviour.externalUrl ? service.behaviour.externalUrl : service?.url
        }/${media.mediaType}/${media.id}`,
        type: 'overseer',
      }}
    />
  );
}

export function ReadarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfigContext();

  if (!config) {
    return null;
  }

  // Find lidarr in services
  const readarr = config.apps.find((service) => service.integration.type === 'readarr');
  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'cover');
  if (!readarr) {
    return null;
  }
  const baseUrl = readarr.behaviour.externalUrl
    ? new URL(readarr.behaviour.externalUrl).origin
    : new URL(readarr.url).origin;
  // Remove '/' from the end of the lidarr url
  const fullLink = poster ? `${baseUrl}${poster.url}` : undefined;
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        ...media,
        title: media.title,
        poster: fullLink,
        artist: media.authorTitle,
        overview: `new book release by ${media.authorTitle}`,
        genres: media.genres ?? [],
        voteAverage: media.ratings.value.toString(),
        type: 'book',
      }}
    />
  );
}

export function LidarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfigContext();

  if (!config) {
    return null;
  }

  // Find lidarr in services
  const lidarr = config.apps.find((service) => service.integration.type === 'lidarr');
  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'cover');
  if (!lidarr) {
    return null;
  }
  const baseUrl = lidarr.behaviour.externalUrl
    ? new URL(lidarr.behaviour.externalUrl).origin
    : new URL(lidarr.url).origin;
  // Remove '/' from the end of the lidarr url
  const fullLink = poster ? `${baseUrl}${poster.url}` : undefined;
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        type: 'music',
        title: media.title,
        poster: fullLink,
        artist: media.artist.artistName,
        overview: media.overview,
        genres: media.genres,
      }}
    />
  );
}

export function RadarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfigContext();
  const calendar = config?.widgets.find((w) => w.type === 'calendar');

  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'poster');
  return (
    <MediaDisplay
      media={{
        ...media,
        title: media.title ?? media.originalTitle,
        overview: media.overview ?? '',
        genres: media.genres ?? [],
        poster: poster.url,
        altPoster: poster.remoteUrl,
        voteAverage: media.ratings.tmdb.value.toString(),
        imdbId: media.imdbId,
        type: 'movie',
      }}
    />
  );
}

export function SonarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfigContext();
  const calendar = config?.widgets.find((w) => w.type === 'calendar');

  // Find a poster CoverType
  const poster = media.series.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        ...media,
        genres: media.series.genres ?? [],
        overview: media.overview ?? media.series.overview ?? '',
        title: media.series.title,
        poster: poster.url,
        altPoster: poster.remoteUrl,
        episodeNumber: media.episodeNumber,
        seasonNumber: media.seasonNumber,
        episodetitle: media.title,
        imdbId: media.series.imdbId,
        voteAverage: media.series.ratings.value.toString(),
        type: 'tvshow',
      }}
    />
  );
}

export function MediaDisplay({ media }: { media: IMedia }) {
  const [opened, setOpened] = useState(false);
  const { secondaryColor } = useColorTheme();
  const { t } = useTranslation('modules/common-media-cards');

  return (
    <Group noWrap style={{ maxHeight: 250, maxWidth: 400 }} p={0} m={0} spacing="xs">
      <Image src={media.poster?? media.altPoster} height={200} width={150} radius="md" fit="cover" withPlaceholder/>
      <Stack justify="space-around">
        <Stack spacing="sm">
          <Text lineClamp={2}>
            <Title order={5}>{media.title}</Title>
          </Text>
          <Group
            spacing={5}
            style={{
              maxWidth: 250,
            }}
          >
            {media.type === 'tvshow' && (
              <Badge variant="dot" size="xs" radius="md" color="blue" style={{ maxWidth: 200 }}>
                s{media.seasonNumber}e{media.episodeNumber} - {media.episodetitle}
              </Badge>
            )}
            {media.type === 'music' && (
              <Badge variant="dot" size="xs" radius="md" color="green">
                {media.artist}
              </Badge>
            )}
            {media.type === 'movie' && (
              <Badge variant="dot" size="xs" radius="md" color="orange">
                Radarr
              </Badge>
            )}
            {media.type === 'book' && (
              <Badge variant="dot" size="xs" radius="md" color="red">
                Readarr
              </Badge>
            )}
            {media.genres.slice(0, 2).map((genre) => (
              <Badge size="xs" radius="md" key={genre}>
                {genre}
              </Badge>
            ))}
          </Group>
          <Text color="dimmed" size="xs" lineClamp={4}>
            {media.overview}
          </Text>
        </Stack>
        <Group spacing="xs">
          {media.plexUrl && (
            <Button
              component="a"
              target="_blank"
              variant="outline"
              href={media.plexUrl}
              size="sm"
              rightIcon={<IconPlayerPlay size={15} />}
            >
              {t('buttons.play')}
            </Button>
          )}
          {media.imdbId && (
            <Button
              component="a"
              target="_blank"
              href={`https://www.imdb.com/title/${media.imdbId}`}
              variant="outline"
              size="sm"
              rightIcon={<IconExternalLink size={15} />}
            >
              IMDb
            </Button>
          )}
          {media.overseerrId && (
            <Button
              component="a"
              target="_blank"
              href={media.overseerrId}
              variant="outline"
              size="sm"
              rightIcon={<IconExternalLink size={15} />}
            >
              TMDb
            </Button>
          )}
          {media.type === 'overseer' && !media.overseerrResult?.mediaInfo?.mediaAddedAt && (
            <>
              <RequestModal
                base={media.overseerrResult as Result}
                opened={opened}
                setOpened={setOpened}
              />
              <Button
                onClick={() => setOpened(true)}
                color={secondaryColor}
                size="sm"
                rightIcon={<IconDownload size={15} />}
              >
                {t('buttons.request')}
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
