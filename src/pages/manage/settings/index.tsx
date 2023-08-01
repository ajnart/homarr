import { Text, Title } from '@mantine/core';
import Head from 'next/head';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';

const SettingsPage = () => {
  return (
    <ManageLayout>
      <Head>
        <title>Settings • Homarr</title>
      </Head>

      <Title>Settings</Title>
      <Text>Coming soon!</Text>
    </ManageLayout>
  );
};

export default SettingsPage;
