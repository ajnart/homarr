import { eq } from 'drizzle-orm';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { env } from '~/env';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { userSettings } from '~/server/db/schema';
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

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const boardName = await getDefaultBoardAsync(session?.user?.id, 'default');

  const translations = await getServerSideTranslations(
    boardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );
  const config = await getFrontendConfig(boardName);

  if (!config?.settings?.access?.allowGuests && !session?.user) {
    return {
      notFound: true,
      props: {
        primaryColor: config.settings.customization.colors.primary,
        secondaryColor: config.settings.customization.colors.secondary,
        primaryShade: config.settings.customization.colors.shade,
      },
    };
  }

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
