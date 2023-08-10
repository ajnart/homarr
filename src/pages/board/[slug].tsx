import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { z } from 'zod';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { env } from '~/env';
import { configExists } from '~/tools/config/configExists';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';

export default function BoardPage({
  config: initialConfig,
  dockerEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <BoardLayout dockerEnabled={dockerEnabled}>
      <Dashboard />
    </BoardLayout>
  );
}

type BoardGetServerSideProps = {
  config: ConfigType;
  dockerEnabled: boolean;
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
  const translations = await getServerSideTranslations(boardNamespaces, locale, req, res);

  return {
    props: {
      config,
      primaryColor: config.settings.customization.colors.primary,
      secondaryColor: config.settings.customization.colors.secondary,
      primaryShade: config.settings.customization.colors.shade,
      dockerEnabled: !!env.DOCKER_HOST && !!env.DOCKER_PORT,
      ...translations,
    },
  };
};
