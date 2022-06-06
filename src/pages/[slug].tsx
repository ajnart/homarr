import { GetServerSidePropsContext } from 'next';
import path from 'path';
import fs from 'fs';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';
import Layout from '../components/layout/Layout';

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<{ props: { config: Config } }> {
  const configByUrl = context.query.slug;
  const configPath = path.join(process.cwd(), 'data/configs', `${configByUrl}.json`);
  const configExists = fs.existsSync(configPath);
  if (!configExists) {
    // Redirect to 404
    context.res.writeHead(301, { Location: '/404' });
    context.res.end();
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
  const config = fs.readFileSync(configPath, 'utf8');
  // Print loaded config
  return {
    props: {
      config: JSON.parse(config),
    },
  };
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
