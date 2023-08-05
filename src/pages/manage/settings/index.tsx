import { Text, Title } from '@mantine/core';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';

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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    ['common'],
    ctx.locale,
    undefined,
    undefined
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default SettingsPage;
