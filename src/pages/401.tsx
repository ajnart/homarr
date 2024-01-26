import { Button, Center, createStyles, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import Head from 'next/head';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import Link from 'next/link';

import imageAccessDenied from '~/images/undraw_secure_login_pdn4.svg';
import { pageAccessDeniedNamespaces } from '~/tools/server/translation-namespaces';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { GetServerSidePropsContext } from 'next';

export default function Custom401() {
  const { classes } = useStyles();
  const { t } = useTranslation('layout/errors/access-denied');
  return (
    <MainLayout>
      <Center h="100dvh" w="100dvw">
      <Head>
        <title>Access denied • Homarr</title>
      </Head>
      <Stack maw={500} p="xl">
        <Image className={classes.image} src={imageAccessDenied} width={200} height={200} alt="" />
        <Title>{t('title')}</Title>
        <Text>{t('text')}</Text>

        <Button component={Link} variant="light" href="/auth/login">
          {t('switchAccount')}
        </Button>
      </Stack>
    </Center>
    </MainLayout>
  )
}

export async function getStaticProps({ req, res, locale }: GetServerSidePropsContext) {
  const translations = await getServerSideTranslations(
    [...pageAccessDeniedNamespaces, 'common'],
    locale,
    req,
    res
  );
  return {
    props: {
      ...translations,
    },
  };
}

const useStyles = createStyles(() => ({
  image: {
    margin: '0 auto',
    display: 'block',
  },
}));