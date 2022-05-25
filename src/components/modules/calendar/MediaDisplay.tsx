import { Stack, Image, Group, Title, Badge, Text, ActionIcon, Anchor } from '@mantine/core';
import { Link } from 'tabler-icons-react';

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
    <Group noWrap align="self-start" mr={15}>
      {media.poster && (
        <Image
          radius="md"
          fit="cover"
          src={media.poster}
          alt={media.title}
          width={300}
          height={400}
        />
      )}

      <Stack
        justify="space-between"
        sx={(theme) => ({
          height: 400,
        })}
      >
        <Group direction="column">
          <Group noWrap>
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
          </Group>
          {media.artist && (
            <Text
              style={{
                textAlign: 'center',
                color: '#a0aec0',
              }}
            >
              New album from {media.artist}
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
          <Text lineClamp={12} align="justify">
            {media.overview}
          </Text>
        </Group>
        {/*Add the genres at the bottom of the poster*/}
        <Group>
          {media.genres.map((genre: string, i: number) => (
            <Badge key={i}>{genre}</Badge>
          ))}
        </Group>
      </Stack>
    </Group>
  );
}

export function ReadarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Find a poster CoverType
  const poster = media.author.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        title: media.title,
        poster: poster ? poster.url : undefined,
        artist: media.author.authorName,
        overview: media.overview,
        genres: media.genres,
      }}
    />
  );
}

export function LidarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Find a poster CoverType
  const poster = media.artist.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <MediaDisplay
      media={{
        title: media.title,
        poster: poster ? poster.url : undefined,
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
