import { Title } from '@mantine/core';
import Head from 'next/head';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';

const PreferencesPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>Preferences • Homarr</title>
      </Head>
      <Title>Preferences</Title>
    </MainLayout>
  );
};

export default PreferencesPage;
