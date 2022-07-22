import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';
import { migrateToIdConfig } from '../tools/migrate';
import { getConfig } from '../tools/getConfig';
import { useColorTheme } from '../tools/color';
import Layout from '../components/layout/Layout';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookie('config-name', 'default', {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    cookie = 'default';
  }
  return getConfig(cookie as string);
}

export default function HomePage(props: any) {
  const { config: initialConfig }: { config: Config } = props;
  const { setConfig } = useConfig();
  const { setPrimaryColor, setSecondaryColor } = useColorTheme();
  useEffect(() => {
    const migratedConfig = migrateToIdConfig(initialConfig);
    setPrimaryColor(migratedConfig.settings.primaryColor || 'red');
    setSecondaryColor(migratedConfig.settings.secondaryColor || 'orange');
    setConfig(migratedConfig);
  }, [initialConfig]);
  return (
    <Layout>
      <AppShelf />
      <LoadConfigComponent />
    </Layout>
  );
}
