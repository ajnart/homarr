import { getCookie, setCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { useEffect } from 'react';
import AppShelf from '../components/AppShelf/AppShelf';
import LoadConfigComponent from '../components/Config/LoadConfig';
import { Config } from '../tools/types';
import { useConfig } from '../tools/state';
import { migrateToIdConfig } from '../tools/migrate';
import { getConfig } from '../tools/getConfig';

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let cookie = getCookie('config-name', { req, res });
  if (!cookie) {
    setCookies('config-name', 'default', {
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
  useEffect(() => {
    const migratedConfig = migrateToIdConfig(initialConfig);
    setConfig(migratedConfig);
  }, [initialConfig]);
  return (
    <>
      <AppShelf />
      <LoadConfigComponent />
    </>
  );
}
