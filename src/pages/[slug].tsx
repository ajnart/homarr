import { getCookie } from 'cookies-next';
import fs from 'fs';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import path from 'path';
import { useEffect } from 'react';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useConfigContext } from '../config/provider';
import { useConfigStore } from '../config/store';
import { getConfig } from '../tools/getConfig';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { ConfigType } from '../types/config';

type ServerSideProps = {
  config: ConfigType;
};

export async function getServerSideProps({
  req,
  res,
  locale,
  query,
}: GetServerSidePropsContext): Promise<{ props: ServerSideProps }> {
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
          schemaVersion: '1.0',
          configProperties: {
            name: 'Default Configuration',
          },
          apps: [],
          settings: {
            common: {
              searchEngine: {
                type: 'google',
                properties: {
                  enabled: true,
                  openInNewTab: true,
                },
              },
              defaultConfig: 'default',
            },
            customization: {
              layout: {
                enabledLeftSidebar: false,
                enabledRightSidebar: false,
                enabledSearchbar: true,
                enabledDocker: false,
                enabledPing: false,
              },
              colors: {},
            },
          },
          categories: [],
          wrappers: [],
          widgets: [],
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
  const { config: initialConfig }: { config: ConfigType } = props;
  const { name: configName } = useConfigContext();
  const { updateConfig } = useConfigStore();
  useEffect(() => {
    if (!configName) {
      return;
    }
    updateConfig(configName, () => initialConfig);
  }, [initialConfig]);
  return (
    <Layout>
      <Dashboard />
      <LoadConfigComponent />
    </Layout>
  );
}
