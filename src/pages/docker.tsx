import { Stack } from '@mantine/core';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/main';
import { env } from '~/env';
import ContainerActionBar from '~/modules/Docker/ContainerActionBar';
import DockerTable from '~/modules/Docker/DockerTable';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export default function DockerPage() {
  const [selection, setSelection] = useState<ContainerInfo[]>([]);
  const dockerEnabled = env.NEXT_PUBLIC_DOCKER_ENABLED;
  const { data, refetch, isRefetching } = api.docker.containers.useQuery(undefined, {
    enabled: dockerEnabled,
  });

  const reload = () => {
    refetch();
    setSelection([]);
  };

  return (
    <MainLayout>
      <Stack>
        <ContainerActionBar selected={selection} reload={reload} isLoading={isRefetching} />
        <DockerTable containers={data ?? []} selection={selection} setSelection={setSelection} />
      </Stack>
    </MainLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
  if (!env.NEXT_PUBLIC_DOCKER_ENABLED) return { notFound: true };
  const session = await getServerAuthSession({ req, res });
  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);
  return {
    props: {
      ...translations,
    },
  };
};
