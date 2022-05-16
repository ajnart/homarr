import { Group } from '@mantine/core';
import { getCookie, setCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import path from 'path';
import fs from 'fs';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookies('config-name', 'default', { req, res, maxAge: 60 * 60 * 24 * 30 });
    cookie = 'default';
  }
  // Check if the config file exists
  const configPath = path.join(process.cwd(), 'data/configs', `${cookie}.json`);
  if (!fs.existsSync(configPath)) {
    return {
      props: {
        config: {
          name: cookie.toString(),
          services: [],
          settings: {
            enabledModules: [],
            searchBar: true,
            searchUrl: 'https://www.google.com/search?q=',
          },
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
  const { config, loadConfig, setConfig, getConfigs } = useConfig();
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);
  return (
    <>
      <Group align="start" position="apart" noWrap>
        <AppShelf />
      </Group>
      <LoadConfigComponent />
    </>
  );
}
