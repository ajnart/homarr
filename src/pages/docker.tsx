import { Stack } from '@mantine/core';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { env } from '~/env';
import ContainerActionBar from '~/modules/Docker/ContainerActionBar';
import DockerTable from '~/modules/Docker/DockerTable';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export default function DockerPage() {
  const [selection, setSelection] = useState<ContainerInfo[]>([]);
  const { data, refetch, isRefetching } = api.docker.containers.useQuery();

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
  if (!env.DOCKER_HOST || !env.DOCKER_PORT) return { notFound: true };
  const session = await getServerAuthSession({ req, res });
  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(boardNamespaces, locale, req, res);
  return {
    props: {
      ...translations,
    },
  };
};
