import { RadarrMediaDisplay } from './MediaDisplay';

export default {
  title: 'Media display component',
  args: {
    media: {
      title: 'Doctor Strange in the Multiverse of Madness',
      originalTitle: 'Doctor Strange in the Multiverse of Madness',
      originalLanguage: {
        id: 1,
        name: 'English',
      },
      secondaryYearSourceId: 0,
      sortTitle: 'doctor strange in multiverse madness',
      sizeOnDisk: 0,
      status: 'announced',
      overview:
        'Doctor Strange, with the help of mystical allies both old and new, traverses the mind-bending and dangerous alternate realities of the Multiverse to confront a mysterious new adversary.',
      inCinemas: '2022-05-04T00:00:00Z',
      images: [
        {
          coverType: 'poster',
          url: 'https://image.tmdb.org/t/p/original/wRnbWt44nKjsFPrqSmwYki5vZtF.jpg',
        },
        {
          coverType: 'fanart',
          url: 'https://image.tmdb.org/t/p/original/ndCSoasjIZAMMDIuMxuGnNWu4DU.jpg',
        },
      ],
      website: 'https://www.marvel.com/movies/doctor-strange-in-the-multiverse-of-madness',
      year: 2022,
      hasFile: false,
      youTubeTrailerId: 'aWzlQ2N6qqg',
      studio: 'Marvel Studios',
      path: '/config/Doctor Strange in the Multiverse of Madness (2022)',
      qualityProfileId: 1,
      monitored: true,
      minimumAvailability: 'announced',
      isAvailable: true,
      folderName: '/config/Doctor Strange in the Multiverse of Madness (2022)',
      runtime: 126,
      cleanTitle: 'doctorstrangeinmultiversemadness',
      imdbId: 'tt9419884',
      tmdbId: 453395,
      titleSlug: '453395',
      certification: 'PG-13',
      genres: ['Fantasy', 'Action', 'Adventure'],
      tags: [],
      added: '2022-04-29T20:52:33Z',
      ratings: {
        tmdb: {
          votes: 0,
          value: 0,
          type: 'user',
        },
      },
      collection: {
        name: 'Doctor Strange Collection',
        tmdbId: 618529,
        images: [],
      },
      id: 1,
    },
  },
};

export const Default = (args: any) => <RadarrMediaDisplay {...args} />;
