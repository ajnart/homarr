import { getCookie } from 'cookies-next';
import fs from 'fs';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import path from 'path';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import Layout from '../components/layout/Layout';
import { getConfig } from '../tools/getConfig';
import { useConfig } from '../tools/state';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { Config } from '../tools/types';

export async function getServerSideProps({
  req,
  res,
  locale,
  query,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  const configByUrl = query.slug;
  const configPath = path.join(process.cwd(), 'data/configs', `${configByUrl}.json`);
  const configExists = fs.existsSync(configPath);
  if (!configExists) {
    // Redirect to 404
    res.writeHead(301, { Location: '/404' });
    res.end();
    return {
      props: {
        config: {
          name: 'Default config',
          services: [],
          settings: {
            searchUrl: 'https://www.google.com/search?q=',
          },
          modules: {},
        },
      },
    };
  }

  const configLocale = getCookie('config-locale', { req, res });
  const targetLanguage = (configLocale ?? locale) as string;
  const translations = await serverSideTranslations(targetLanguage, dashboardNamespaces);
  return getConfig(configByUrl as string, translations);
}

export default function HomePage(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { setConfig } = useConfig();
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);
  return (
    <Layout>
      <AppShelf />
      <LoadConfigComponent />
    </Layout>
  );
}
