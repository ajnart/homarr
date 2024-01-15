import { Button, Center, createStyles, Stack, Text, Title } from '@mantine/core';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import pageNotFoundImage from '~/images/undraw_page_not_found_re_e9o6.svg';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { pageNotFoundNamespaces } from '~/tools/server/translation-namespaces';

export default function Custom404() {
  const { classes } = useStyles();

  const { t } = useTranslation('layout/errors/not-found');

  return (
    <Center h="100dvh" w="100dvw">
      <Head>
        <title>Page not found • Homarr</title>
      </Head>
      <Stack maw={500} p="xl">
        <Image className={classes.image} src={pageNotFoundImage} width={200} height={200} alt="" />
        <Title>{t('title')}</Title>
        <Text>{t('text')}</Text>

        <Button component={Link} variant="light" href="/b">
          {t('button')}
        </Button>
        <Button component={Link} variant="light" href="/auth/login">
          Login
        </Button>
      </Stack>
    </Center>
  );
}

export async function getStaticProps({ req, res, locale }: GetServerSidePropsContext) {
  const translations = await getServerSideTranslations(
    [...pageNotFoundNamespaces, 'common'],
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
