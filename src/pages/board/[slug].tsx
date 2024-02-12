import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { z } from 'zod';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { BoardLayout } from '~/components/layout/Templates/BoardLayout';
import { useInitConfig } from '~/config/init';
import { dockerRouter } from '~/server/api/routers/docker/router';
import { getServerAuthSession } from '~/server/auth';
import { configExists } from '~/tools/config/configExists';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';
import { env } from 'process';
import fs from 'fs';

export default function BoardPage({
  config: initialConfig,
  isDockerEnabled: isDockerEnabled
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <BoardLayout isDockerEnabled={isDockerEnabled}>
      <Dashboard />
    </BoardLayout>
  );
}

const routeParamsSchema = z.object({
  slug: z.string(),
});

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const routeParams = routeParamsSchema.safeParse(context.params);
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
    context.locale,
    context.req,
    context.res
  );

  const session = await getServerAuthSession({ req: context.req, res: context.res });

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
