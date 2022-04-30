import { Notification } from '@mantine/core';
import AppShelf from '../components/AppShelf/AppShelf';
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
