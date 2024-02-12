import { Alert, Stack, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import Consola from 'consola';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import ContainerActionBar from '~/components/Manage/Tools/Docker/ContainerActionBar';
import ContainerTable from '~/components/Manage/Tools/Docker/ContainerTable';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { dockerRouter } from '~/server/api/routers/docker/router';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export default function DockerPage({
  initialContainers,
  dockerIsConfigured,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [selection, setSelection] = useState<ContainerInfo[]>([]);
  const { data, refetch, isRefetching } = api.docker.containers.useQuery(undefined, {
    initialData: initialContainers,
    cacheTime: 60 * 1000 * 5,
    staleTime: 60 * 1000 * 1,
    enabled: dockerIsConfigured,
  });

  const { t } = useTranslation('tools/docker');

  const reload = () => {
    refetch();
    setSelection([]);
  };

  if (!dockerIsConfigured) {
    return (
      <ManageLayout>
        <Title mb="lg">{t('title')}</Title>
        <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
          {t('alerts.notConfigured.text')}
        </Alert>
      </ManageLayout>
    );
  }

  return (
    <ManageLayout>
      <Stack>
        <ContainerActionBar selected={selection} reload={reload} isLoading={isRefetching} />
        <ContainerTable containers={data ?? []} selection={selection} setSelection={setSelection} />
      </Stack>
    </ManageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({ req: context.req, res: context.res });
  const result = checkForSessionOrAskForLogin(context, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
  }

  const caller = dockerRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
  });

  const translations = await getServerSideTranslations(
    [...boardNamespaces, 'layout/manage', 'tools/docker'],
    context.locale,
    context.req,
    context.res
  );

  let containers = [];
  try {
    containers = await caller.containers();
  } catch (error) {
    Consola.error(`The docker integration failed with the following error: ${error}`);
    return {
      props: {
        dockerIsConfigured: false,
        ...translations,
      },
    };
  }

  return {
    props: {
      initialContainers: containers,
      dockerIsConfigured: true,
      ...translations,
    },
  };
};
