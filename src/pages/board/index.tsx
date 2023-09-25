import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { SSRConfig, useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { env } from '~/env';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';

export default function BoardPage({
  config: initialConfig,
  dockerEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t, i18n } = useTranslation(boardNamespaces, {
    bindI18n: 'languageChanged loaded',
  });
  // bindI18n: loaded is needed because of the reloadResources call
  // if all pages use the reloadResources mechanism, the bindI18n option can also be defined in next-i18next.config.js
  useEffect(() => {
    if (i18n.language !== i18n.resolvedLanguage) {
      i18n.reloadResources(i18n.resolvedLanguage, boardNamespaces);
    }
  }, []);
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

  if (!config.settings.access.allowGuests && !session?.user) {
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
