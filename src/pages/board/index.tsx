import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { getServerAuthSession } from '~/server/auth';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';
import { env } from 'process';
import fs from 'fs';

export default function BoardPage({
  config: initialConfig,
  isDockerEnabled: isDockerEnabled,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <BoardLayout isDockerEnabled={isDockerEnabled}>
      <Dashboard />
    </BoardLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  const boardName = await getDefaultBoardAsync(session?.user?.id, 'default');

  const translations = await getServerSideTranslations(
    boardNamespaces,
    context.locale,
    context.req,
    context.res
  );
  const config = await getFrontendConfig(boardName);

  const result = checkForSessionOrAskForLogin(
    context,
    session,
    () => config.settings.access.allowGuests || session?.user != undefined
  );
  if (result) {
    return result;
  }

  const isDockerEnabled: boolean = !!env.DOCKER_HOST || !!env.DOCKER_PORT || fs.existsSync('/var/run/docker.sock');

  return {
    props: {
      config,
      primaryColor: config.settings.customization.colors.primary,
      secondaryColor: config.settings.customization.colors.secondary,
      primaryShade: config.settings.customization.colors.shade,
      isDockerEnabled: isDockerEnabled,
      ...translations,
    },
  };
};
