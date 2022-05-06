import { Stack, Image, Group, Title, Badge, Text, ActionIcon, Anchor } from '@mantine/core';
import { Link } from 'tabler-icons-react';

export interface IMedia {
  id: string;
  title: string;
  description: string;
  poster: string;
  type: string;
  genres: string[];
}

export function RadarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Find a poster CoverType
  const poster = media.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <Group noWrap align="self-start">
      <Image
        fit="cover"
        src={poster.url}
        alt={media.title}
        style={{
          maxWidth: 300,
        }}
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
          <Text>{media.overview}</Text>
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

export function SonarrMediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Find a poster CoverType
  const poster = media.series.images.find((image: any) => image.coverType === 'poster');
  // Return a movie poster containting the title and the description
  return (
    <Group noWrap align="self-start">
      <Image
        src={poster.url}
        fit="cover"
        width={300}
        height={400}
        alt={media.series.title}
      />
      <Stack
        justify="space-between"
        sx={(theme) => ({
          height: 400,
        })}
      >
        <Group direction="column">
          <Group>
            <Title order={3}>{media.series.title}</Title>
            <Anchor href={`https://www.imdb.com/title/${media.series.imdbId}`} target="_blank">
              <ActionIcon>
                <Link />
              </ActionIcon>
            </Anchor>
          </Group>
          <Text
            style={{
              textAlign: 'center',
              color: '#a0aec0',
            }}
          >
            Season {media.seasonNumber} episode {media.episodeNumber}
          </Text>
          <Text>{media.series.overview}</Text>
        </Group>
        {/*Add the genres at the bottom of the poster*/}
        <Group>
          {media.series.genres.map((genre: string, i: number) => (
            <Badge key={i}>{genre}</Badge>
          ))}
        </Group>
      </Stack>
    </Group>
  );
}
