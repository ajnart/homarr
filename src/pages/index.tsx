import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import LoadConfigComponent from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { useInitConfig } from '../config/init';
import { getConfig } from '../tools/getConfig';
import { dashboardNamespaces } from '../tools/translation-namespaces';
import { Config } from '../tools/types';
import { ConfigType } from '../types/config';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: { config: Config } }> {
  let configName = getCookie('config-name', { req, res });
  const configLocale = getCookie('config-locale', { req, res });
  if (!configName) {
    setCookie('config-name', 'default', {
      req,
      res,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'strict',
    });
    configName = 'default';
  }

  const translations = await serverSideTranslations(
    (configLocale ?? locale) as string,
    dashboardNamespaces
  );
  return getConfig(configName as string, translations);
}

export default function HomePage(props: any) {
  const { config: initialConfig }: { config: ConfigType } = props;
  /*const { setConfig } = useConfig();
  const { setPrimaryColor, setSecondaryColor } = useColorTheme();
  useEffect(() => {
    const migratedConfig = migrateToIdConfig(initialConfig);
    setPrimaryColor(migratedConfig.settings.primaryColor || 'red');
    setSecondaryColor(migratedConfig.settings.secondaryColor || 'orange');
    setConfig(migratedConfig);
  }, [initialConfig]);*/
  useInitConfig(initialConfig);

  return (
    <Layout>
      <Dashboard />
      <LoadConfigComponent />
    </Layout>
  );
}
