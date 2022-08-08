import { Badge, Button, Group, Image, Stack, Text, Title } from '@mantine/core';
import { IconDownload, IconExternalLink, IconPlayerPlay } from '@tabler/icons';
import { useState } from 'react';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import { RequestModal } from '../overseerr/RequestModal';
import { Result } from '../overseerr/SearchResult';

export interface IMedia {
  overview: string;
  imdbId?: any;
  artist?: string;
  title?: string;
  type: 'movie' | 'tvshow' | 'book' | 'music' | 'overseer';
  episodetitle?: string;
  voteAverage?: string;
  poster?: string;
  genres: string[];
  seasonNumber?: number;
  plexUrl?: string;
  episodeNumber?: number;
  [key: string]: any;
}

export function OverseerrMediaDisplay(props: any) {
  const { media }: { media: Result } = props;
  return (
    <MediaDisplay
      media={{
        ...media,
        genres: [],
        overview: media.overview ?? '',
        title: media.title ?? media.name ?? media.originalName ?? undefined,
        poster: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${media.posterPath}`,
        seasonNumber: media.mediaInfo?.seasons.length ?? undefined,
        episodetitle: media.title ?? undefined,
        plexUrl: media.mediaInfo?.plexUrl ?? undefined,
        voteAverage: media.voteAverage?.toString() ?? undefined,
        overseerrResult: media,
        type: 'overseer',
      }}
    />
  );
}

export function ReadarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfig();
  // Find lidarr in services
  const readarr = config.services.find((service: serviceItem) => service.type === 'Readarr');
  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'cover');
  if (!readarr) {
    return null;
  }
  const baseUrl = new URL(readarr.url).origin;
  // Remove '/' from the end of the lidarr url
  const fullLink = `${baseUrl}${poster.url}`;
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
        voteAverage: media.ratings.value.toString() ?? undefined,
        type: 'book',
      }}
    />
  );
}

export function LidarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  const { config } = useConfig();
  // Find lidarr in services
  const lidarr = config.services.find((service: serviceItem) => service.type === 'Lidarr');
  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'cover');
  if (!lidarr) {
    return null;
  }
  const baseUrl = new URL(lidarr.url).origin;
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
  // Find a poster CoverType
  return (
    <MediaDisplay
      media={{
        ...media,
        title: media.title ?? media.originalTitle,
        overview: media.overview ?? '',
        genres: media.genres ?? [],
        poster: media.images.find((image: any) => image.coverType === 'poster')?.url ?? undefined,
        voteAverage: media.ratings.tmdb.value.toString() ?? undefined,
        imdbId: media.imdbId ?? undefined,
        type: 'movie',
      }}
    />
  );
}

export function SonarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Find a poster CoverType
  const poster = media.series.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        ...media,
        genres: media.series.genres ?? [],
        overview: media.overview ?? media.series.overview ?? '',
        title: media.series.title ?? undefined,
        poster: poster ? poster.url : undefined,
        episodeNumber: media.episodeNumber ?? undefined,
        seasonNumber: media.seasonNumber ?? undefined,
        episodetitle: media.title ?? undefined,
        imdbId: media.series.imdbId ?? undefined,
        voteAverage: media.series.ratings.value.toString() ?? undefined,
        type: 'tvshow',
      }}
    />
  );
}

export function MediaDisplay({ media }: { media: IMedia }) {
  const [opened, setOpened] = useState(false);
  return (
    <Group mr="xs" align="stretch" noWrap style={{ maxHeight: 200 }}>
      <Image src={media.poster} height={200} width={150} radius="md" fit="cover" />
      <Stack justify="space-around">
        <Stack spacing="sm">
          <Text lineClamp={2}>
            <Title order={5}>{media.title}</Title>
          </Text>
          <Group spacing="xs">
            {media.type === 'tvshow' && (
              <Badge variant="dot" size="xs" radius="md" color="blue">
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
        <Group grow>
          {media.plexUrl && (
            <Button
              component="a"
              target="_blank"
              variant="outline"
              href={media.plexUrl}
              size="sm"
              rightIcon={<IconPlayerPlay size={15} />}
            >
              Play
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
          {media.type === 'overseer' && (
            <>
              <RequestModal
                base={media.overseerrResult as Result}
                opened={opened}
                setOpened={setOpened}
              />
              <Button
                onClick={() => setOpened(true)}
                size="sm"
                rightIcon={<IconDownload size={15} />}
              >
                Request
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
