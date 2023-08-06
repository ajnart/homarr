import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
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

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const currentUserSettings = await prisma.userSettings.findFirst({
    where: {
      userId: session?.user?.id,
    },
  });

  const translations = await getServerSideTranslations(
    boardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );
  const boardName = currentUserSettings?.defaultBoard ?? 'default';
  const config = await getFrontendConfig(boardName);

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
