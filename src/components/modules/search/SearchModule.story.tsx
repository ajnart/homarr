import SearchBar from './SearchModule';

export default {
  title: 'Search bar',
  config: {
    searchBar: false,
  },
};

export const Default = (args: any) => <SearchBar {...args} />;
