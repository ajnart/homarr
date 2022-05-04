import AppShelf, { AppShelfItem } from './AppShelf';

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