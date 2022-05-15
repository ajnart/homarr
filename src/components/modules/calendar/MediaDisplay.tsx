import { Stack, Image, Group, Title, Badge, Text, ActionIcon, Anchor } from '@mantine/core';
import { Link } from 'tabler-icons-react';

export interface IMedia {
  overview: string;
  imdbId: any;
  title: string;
  poster: string;
  genres: string[];
  seasonNumber?: number;
  episodeNumber?: number;
}

function MediaDisplay(props: { media: IMedia }) {
  const { media }: { media: IMedia } = props;
  return (
    <Group noWrap align="self-start" mr={15}>
      <Image
        radius="md"
        fit="cover"
        src={media.poster}
        alt={media.title}
        width={300}
        height={400}
      />
      <Stack
        justify="space-between"
        sx={(theme) => ({
          height: 400,
        })}
      >
        <Group direction="column">
          <Group>
            <Title order={3}>{media.title}</Title>
            <Anchor href={`https://www.imdb.com/title/${media.imdbId}`} target="_blank">
              <ActionIcon>
                <Link />
              </ActionIcon>
            </Anchor>
          </Group>
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
          <Text align="justify">{media.overview}</Text>
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
