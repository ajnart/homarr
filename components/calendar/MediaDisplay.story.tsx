import MediaDisplay from './MediaDisplay';

export default {
  title: 'Media display component',
  args: {
    media: {
      id: '1',
      title: 'Media title',
      description: 'Media description',
      poster: 'https://fr.web.img5.acsta.net/pictures/22/04/08/10/30/1779137.jpg',
      type: 'movie',
      genres: ['Action', 'Adventure', 'Fantasy'],
    },
  },
};

export const Default = (args: any) => <MediaDisplay {...args} />;
