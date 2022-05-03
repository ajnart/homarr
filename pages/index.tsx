import { Group, Notification } from '@mantine/core';
import AppShelf from '../components/AppShelf/AppShelf';
import CalendarComponent from '../components/calendar/CalendarComponent';
import LoadConfigComponent from '../components/Config/LoadConfig';
import SearchBar from '../components/SearchBar/SearchBar';

export default function HomePage() {
  return (
    <>
      <SearchBar />
      <Group align={'start'} position="apart" noWrap>
        <AppShelf />
        <CalendarComponent />
      </Group>
      <LoadConfigComponent />
    </>
  );
}
