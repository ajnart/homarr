import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { SSRConfig } from 'next-i18next';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { dockerRouter } from '~/server/api/routers/docker/router';
import { getServerAuthSession } from '~/server/auth';
import { getDefaultBoardAsync } from '~/server/db/queries/userSettings';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';

export default function BoardPage({
  config: initialConfig,
  isDockerEnabled,
  initialContainers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);
  const { data } = api.docker.containers.useQuery(undefined, {
    initialData: initialContainers ?? undefined,
    enabled: isDockerEnabled,
    cacheTime: 60 * 1000 * 5,
    staleTime: 60 * 1000 * 1,
  });

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
  const caller = dockerRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
  });
  let containers = undefined;
  // Fetch containers if user is admin, otherwise we don't need them
  try {
    if (session?.user.isAdmin == true) containers = await caller.containers();
  } catch (error) {
    
  }
  return {
    props: {
      config,
      primaryColor: config.settings.customization.colors.primary,
      secondaryColor: config.settings.customization.colors.secondary,
      primaryShade: config.settings.customization.colors.shade,
      isDockerEnabled: containers != undefined,
      initialContainers: containers ?? null,
      ...translations,
    },
  };
};
