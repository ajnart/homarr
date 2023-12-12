import { Text, Title } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const [nonDebouncedSearch, setNonDebouncedSearch] = useState<string | undefined>('');
  const [debouncedSearch] = useDebouncedValue<string | undefined>(nonDebouncedSearch, 200);
  const { t } = useTranslation('manage/integrations');

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="md">{t('pageTitle')}</Title>
      <Text mb="xl">{t('text')}</Text>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user.isAdmin) {
    return {
      redirect: {
        destination: '/401',
        permanent: false,
      },
    };
  }

  const caller = integrationsRouter

  const translations = await getServerSideTranslations(
    [...manageNamespaces, 'manage/integrations'],
    ctx.locale,
    ctx.req,
    ctx.res,
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default ManageUsersPage;
