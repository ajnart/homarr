import SearchBar from './SearchBar';

export default {
  title: 'Search bar',
  config: {
    searchBar: false,
  },
};

export const Default = (args: any) => <SearchBar {...args} />;
