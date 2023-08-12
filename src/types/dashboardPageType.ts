import { SSRConfig } from 'next-i18next';

import { ConfigType } from './config';

export type DashboardServerSideProps = {
  config: ConfigType;
  // eslint-disable-next-line react/no-unused-prop-types
  configName: string;
  // eslint-disable-next-line react/no-unused-prop-types
  _nextI18Next?: SSRConfig['_nextI18Next'];
};
