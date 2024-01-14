import { Calendar } from '~/tools/server/sdk/calendar/calendar';
import { AppIntegrationType, ConfigAppType } from '~/types/app';
import { Promise } from 'ts-toolbelt/out/Any/Promise';
import { TypeOf, z } from 'zod';
import { calendarEvents, calendarMediaEventSchema } from '~/widgets/calendar/type';
import axios from 'axios';
import Consola from 'consola';
import { findAppProperty } from '~/tools/client/app-properties';

const integrationTypeConfigurationMap = new Map<AppIntegrationType['type'], {
  endpoint: string;
  mediaType: z.infer<typeof calendarMediaEventSchema>['content']['mediaType'],
  iconUrl: string;
  viewPath: string;
}>([
  ['sonarr', {
    endpoint: '/api/v3/calendar',
    mediaType: 'series',
    iconUrl: '/imgs/app-icons/sonarr.svg',
    viewPath: 'series',
  }],
  ['radarr', {
    endpoint: '/api/v3/calendar',
    mediaType: 'movie',
    iconUrl: '/imgs/app-icons/radarr.svg',
    viewPath: 'movie',
  }],
  ['lidarr', {
    endpoint: '/api/v1/calendar',
    mediaType: 'music',
    iconUrl: '/imgs/app-icons/lidarr.svg',
    viewPath: '', // TODO: Enter actual value
  }],
  ['readarr', {
    endpoint: '/api/v1/calendar',
    mediaType: 'book',
    iconUrl: '/imgs/app-icons/readarr.svg',
    viewPath: '', // TODO: Enter actual value
  }],
]);

const mediaSchema = z.array(z.object({
  id: z.number(),
  seriesId: z.number().optional(),
  title: z.string(),
  overview: z.string().optional(),
  seasonNumber: z.number().optional(),
  episodeNumber: z.number().optional(),
  originalTitle: z.string().optional(), // supported by Radarr only
  sizeOnDisk: z.number().optional(), // supported by Radarr only
  airDateUtc: z.string().refine(value => new Date(value)).optional(),
  digitalRelease: z.string().refine(value => new Date(value)).optional(),
  series: z.object({
    title: z.string(),
    images: z.array(z.object({
      coverType: z.enum(['banner', 'poster', 'fanart', 'clearlogo', 'screenshot']),
      remoteUrl: z.string().url(),
    })),
    imdbId: z.string(),
    titleSlug: z.string()
  }).optional(),
  images: z.array(z.object({
    coverType: z.enum(['banner', 'poster', 'fanart', 'clearlogo', 'screenshot']),
    remoteUrl: z.string().url().optional(),
  })).optional(),
  imdbId: z.string().optional(),
  tmdbId: z.number().optional(),
}));

export class MediaServerCalendar extends Calendar {
  async getEvents(app: ConfigAppType, start: Date, end: Date): Promise<TypeOf<typeof calendarEvents>> {
    if (!app.integration) {
      throw new Error(`App '${app.name}' (${app.id}) does not have an integration`);
    }
    const endpoint = integrationTypeConfigurationMap.get(app.integration!.type);
    if (!endpoint) {
      throw new Error(`App integration '${app.integration.type}' is not supported by this calendar.`);
    }

    // Get the origin URL
    let { href: origin } = new URL(app.url);
    if (origin.endsWith('/')) {
      origin = origin.slice(0, -1);
    }

    const apiKey = findAppProperty(app, 'apiKey');

    return axios
      .get(
        `${origin}${endpoint.endpoint}?apiKey=${apiKey}&end=${end.toISOString()}&start=${start.toISOString()}&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true&&unmonitored=true`,
      )
      .then((response) => {
        const data = mediaSchema.parse(response.data);

        return {
          events: data.map((event) => {
            const imageUrl =
              event.series?.images.find(img => img.coverType === 'poster')?.remoteUrl ??
              event.images?.find(img => img.coverType === 'poster')?.remoteUrl;

            const links: z.infer<typeof calendarMediaEventSchema>['links'] = [
              {
                href: `${app.url}/${endpoint.viewPath}/${event.series?.titleSlug ?? event.tmdbId ?? event.id}`,
                name: app.name,
                logo: endpoint.iconUrl
              },
            ];

            if (event.tmdbId) {
              links.push({
                href: `https://www.themoviedb.org/movie/${event.tmdbId}`,
                name: 'TMDB',
                color: '#032541',
                isDark: true,
                logo: '/imgs/app-icons/tmdb-logo.png',
              });
            }

            if (event.imdbId) {
              links.push({
                href: `https://www.imdb.com/title/${event.imdbId}/`,
                name: 'IMDb',
                color: '#f5c518',
                isDark: false,
                logo: '/imgs/app-icons/imdb-logo.png',
              });
            }

            if (event.series?.imdbId) {
              links.push({
                href: `https://www.imdb.com/title/${event.series.imdbId}/`,
                name: 'IMDb',
                color: '#f5c518',
                isDark: false,
                logo: '/imgs/app-icons/imdb-logo.png',
              });
            }

            return {
              type: 'media',
              name: event.title,
              subName: event.series?.title,
              description: event.overview,
              content: {
                mediaType: endpoint.mediaType,
                episodeNumber: event.episodeNumber,
                seasonNumber: event.seasonNumber,
              },
              poster: imageUrl,
              date: new Date(event.airDateUtc ?? event.digitalRelease!),
              links: links,
            };
          }),
        } as z.infer<typeof calendarEvents>;
      })
      .catch((err) => {
        Consola.error(
          `failed to process request to app '${app.integration!.type}' (${app.id}): ${err}`,
        );
        throw err;
      });
  }
}