import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { z } from 'zod';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { MainLayout } from '~/components/layout/main';
import { useInitConfig } from '~/config/init';
import { configExists } from '~/tools/config/configExists';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';

import { HeaderActions } from '.';

export default function BoardPage({
  config: initialConfig,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <MainLayout headerActions={<HeaderActions />}>
      <Dashboard />
    </MainLayout>
  );
}

type BoardGetServerSideProps = {
  config: ConfigType;
  _nextI18Next?: SSRConfig['_nextI18Next'];
};

const routeParamsSchema = z.object({
  slug: z.string(),
});

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async ({
  params,
  locale,
  req,
  res,
}) => {
  const routeParams = routeParamsSchema.safeParse(params);
  if (!routeParams.success) {
    return {
      notFound: true,
    };
  }

  const isPresent = configExists(routeParams.data.slug);
  if (!isPresent) {
    return {
      notFound: true,
    };
  }

  const config = await getFrontendConfig(routeParams.data.slug);
  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);

  return {
    props: {
      config,
      ...translations,
    },
  };
};
