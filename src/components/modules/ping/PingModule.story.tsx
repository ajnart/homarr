import { serviceItem } from '../../../tools/types';
import PingComponent from './PingModule';

export default {
  title: 'Modules/Search bar',
};

const service: serviceItem = {
  id: '1',
  type: 'Other',
  name: 'YouTube',
  icon: 'https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/youtube.png',
  url: 'https://youtube.com/',
};

export const Default = (args: any) => <PingComponent service={service} />;
