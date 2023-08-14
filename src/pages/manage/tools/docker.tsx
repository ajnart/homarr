import { Alert, Stack, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import Consola from 'consola';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import ContainerActionBar from '~/modules/Docker/ContainerActionBar';
import DockerTable from '~/modules/Docker/DockerTable';
import { dockerRouter } from '~/server/api/routers/docker/router';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
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
        <DockerTable containers={data ?? []} selection={selection} setSelection={setSelection} />
      </Stack>
    </ManageLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
  const session = await getServerAuthSession({ req, res });
  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const caller = dockerRouter.createCaller({
    session: session,
    cookies: req.cookies,
    prisma: prisma,
  });

  const translations = await getServerSideTranslations(
    [...boardNamespaces, 'layout/manage', 'tools/docker'],
    locale,
    req,
    res
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
