import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { z } from 'zod';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { env } from '~/env';
import { getServerAuthSession } from '~/server/auth';
import { configExists } from '~/tools/config/configExists';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';

export default function BoardPage({
  config: initialConfig,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <BoardLayout>
      <Dashboard />
    </BoardLayout>
  );
}

type BoardGetServerSideProps = {
  config: ConfigType;
  _nextI18Next?: SSRConfig['_nextI18Next'];
};

const routeParamsSchema = z.object({
  slug: z.string(),
});

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const routeParams = routeParamsSchema.safeParse(ctx.params);
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
  const translations = await getServerSideTranslations(
    boardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );

  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });

  const result = checkForSessionOrAskForLogin(
    ctx,
    session,
    () => config.settings.access.allowGuests || session?.user != undefined
  );
  if (result) {
    return result;
  }

  return {
    props: {
      config,
      primaryColor: config.settings.customization.colors.primary,
      secondaryColor: config.settings.customization.colors.secondary,
      primaryShade: config.settings.customization.colors.shade,
      ...translations,
    },
  };
};
