import { Stack } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { MainLayout } from '~/components/layout/main';
import ContainerActionBar from '~/modules/Docker/ContainerActionBar';
import DockerTable from '~/modules/Docker/DockerTable';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export default function DockerPage() {
  const [selection, setSelection] = useState<ContainerInfo[]>([]);
  // TODO: read that from somewhere else?
  const dockerEnabled = true;
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
  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);
  return {
    props: {
      ...translations,
    },
  };
};
