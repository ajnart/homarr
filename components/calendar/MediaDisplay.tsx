import { Stack, Image, Group, Title, Badge, Text } from '@mantine/core';

export interface IMedia {
  id: string;
  title: string;
  description: string;
  poster: string;
  type: string;
  genres: string[];
}

export default function MediaDisplay(props: any) {
  const { media }: { media: any } = props;
  // Return a movie poster containting the title and the description
  return (
    <Group noWrap align="self-start">
      <Image
        src={media.series.images[0].url}
        alt={media.series.title}
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
          <Title order={3}>{media.series.title}</Title>
          <Text>{media.overview}</Text>
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
