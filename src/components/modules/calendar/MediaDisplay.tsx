import { Image, Group, Title, Badge, Text, ActionIcon, Anchor, ScrollArea } from '@mantine/core';
import { Link } from 'tabler-icons-react';
import { useConfig } from '../../../tools/state';
import { serviceItem } from '../../../tools/types';

export interface IMedia {
  overview: string;
  imdbId?: any;
  artist?: string;
  title: string;
  poster?: string;
  genres: string[];
  seasonNumber?: number;
  episodeNumber?: number;
}

function MediaDisplay(props: { media: IMedia }) {
  const { media }: { media: IMedia } = props;
  return (
    <Group position="apart">
      <Text>
        {media.poster && (
          <Image
            style={{
              float: 'right',
            }}
            radius="md"
            fit="cover"
            src={media.poster}
            alt={media.title}
            width={250}
            height={400}
          />
        )}
        <Group direction="row">
          <Title order={3}>{media.title}</Title>
          {media.imdbId && (
            <Anchor
              href={`https://www.imdb.com/title/${media.imdbId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ActionIcon>
                <Link />
              </ActionIcon>
            </Anchor>
          )}
          {media.artist && (
            <Text
              style={{
                textAlign: 'center',
                color: '#a0aec0',
              }}
            >
              New release from {media.artist}
            </Text>
          )}
          {media.episodeNumber && media.seasonNumber && (
            <Text
              style={{
                textAlign: 'center',
                color: '#a0aec0',
              }}
            >
              Season {media.seasonNumber} episode {media.episodeNumber}
            </Text>
          )}
        </Group>
        <Group direction="column" position="apart">
          <ScrollArea style={{ height: 250 }}>{media.overview}</ScrollArea>
          <Group align="center" position="center" spacing="xs">
            {media.genres.map((genre: string, i: number) => (
              <Badge size="sm" key={i}>
                {genre}
              </Badge>
            ))}
          </Group>
        </Group>
      </Text>
    </Group>
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
  console.log(poster);
  const fullLink = `${baseUrl}${poster.url}`;
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        title: media.title,
        poster: fullLink,
        artist: media.author.authorName,
        overview: media.overview,
        genres: media.genres,
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
  const fullLink = `${baseUrl}${poster.url}`;
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
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
  const poster = media.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        imdbId: media.imdbId,
        title: media.title,
        overview: media.overview,
        poster: poster.url,
        genres: media.genres,
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
        imdbId: media.series.imdbId,
        title: media.series.title,
        overview: media.series.overview,
        poster: poster.url,
        genres: media.series.genres,
        seasonNumber: media.seasonNumber,
        episodeNumber: media.episodeNumber,
      }}
    />
  );
}
