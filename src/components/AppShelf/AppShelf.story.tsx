import { SimpleGrid } from '@mantine/core';
import AppShelf from './AppShelf';
import { AppShelfItem } from './AppShelfItem';

export default {
  title: 'Item Shelf',
  component: AppShelf,
  args: {
    service: {
      name: 'qBittorrent',
      url: 'http://',
      icon: 'https://cdn.jsdelivr.net/gh/IceWhaleTech/CasaOS-AppStore@main/Apps/qBittorrent/icon.png',
      type: 'qBittorrent',
      apiKey: '',
    },
  },
};

export const Default = (args: any) => <AppShelf {...args} />;
export const One = (args: any) => <AppShelfItem {...args} />;
export const Ten = (args: any) => (
  <SimpleGrid>
    {Array.from(Array(10)).map((_, i) => (
      <AppShelfItem {...args} key={i} />
    ))}
  </SimpleGrid>
);
