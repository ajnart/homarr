import { Group } from '@mantine/core';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import SearchBar from '../components/SearchBar/SearchBar';

export default function HomePage() {
  return (
    <>
      <SearchBar />
      <Group align="start" position="apart" noWrap>
        <AppShelf />
      </Group>
      <LoadConfigComponent />
    </>
  );
}
