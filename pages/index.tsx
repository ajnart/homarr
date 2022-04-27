import AppShelf from '../components/AppShelf/AppShelf';
import { Center, Group } from '@mantine/core';
import LoadConfigComponent from '../components/Config/LoadConfig';
import SearchBar from '../components/SearchBar/SearchBar';

export default function HomePage() {
  return (
    <>
      <SearchBar />
      <AppShelf />
      <LoadConfigComponent />
    </>
  );
}
