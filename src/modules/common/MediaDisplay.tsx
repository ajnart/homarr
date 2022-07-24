import {
  Image,
  Group,
  Title,
  Badge,
  Text,
  ActionIcon,
  Anchor,
  ScrollArea,
  createStyles,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconLink, IconPlayerPlay } from '@tabler/icons';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';

export interface IMedia {
  overview: string;
  imdbId?: any;
  artist?: string;
  title: string;
  poster?: string;
  genres: string[];
  seasonNumber?: number;
  plexUrl?: string;
  episodeNumber?: number;
}

const useStyles = createStyles((theme) => ({
  overview: {
    [theme.fn.largerThan('sm')]: {
      width: 400,
    },
  },
}));

export function MediaDisplay(props: { media: IMedia }) {
  const { media }: { media: IMedia } = props;
  const { classes, cx } = useStyles();
  const phone = useMediaQuery('(min-width: 800px)');
  return (
    <Group {...props} position="apart">
      <Text>
        {media.poster && (
          <Image
            width={phone ? 250 : 100}
            height={phone ? 400 : 160}
            style={{
              float: 'right',
            }}
            radius="md"
            fit="cover"
            src={media.poster}
            alt={media.title}
          />
        )}
        <Group direction="column" style={{ minWidth: phone ? 450 : '65vw' }}>
          <Group noWrap mr="sm" className={classes.overview}>
            <Title order={3}>{media.title}</Title>
            {media.plexUrl && (
              <Tooltip label="Open in Plex">
                <Anchor href={media.plexUrl} target="_blank">
                  <ActionIcon>
                    <IconPlayerPlay />
                  </ActionIcon>
                </Anchor>
              </Tooltip>
            )}
            {media.plexUrl && (
              <Badge color="green" size="lg">
                Available on Plex
              </Badge>
            )}
            {media.imdbId && (
              <Anchor href={`https://www.imdb.com/title/${media.imdbId}`} target="_blank">
                <ActionIcon>
                  <IconLink />
                </ActionIcon>
              </Anchor>
            )}
          </Group>
          {media.artist && (
            <Text
              style={{
                textAlign: 'center',
                color: 'gray',
              }}
            >
              New release from {media.artist}
            </Text>
          )}
          {(media.episodeNumber || media.seasonNumber) && (
            <Text
              style={{
                textAlign: 'center',
                color: 'gray',
              }}
            >
              Season {media.seasonNumber} {media.episodeNumber && `episode ${media.episodeNumber}`}
            </Text>
          )}
        </Group>
        <Group direction="column" position="apart">
          <ScrollArea style={{ height: 280, maxWidth: 700 }}>{media.overview}</ScrollArea>
          <Group align="center" position="center" spacing="xs">
            {media.genres.slice(-5).map((genre: string, i: number) => (
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
  const fullLink = poster ? `${baseUrl}${poster.url}` : undefined;
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
