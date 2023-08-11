import { Alert, Stack, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { ContainerInfo } from 'dockerode';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { env } from '~/env';
import ContainerActionBar from '~/modules/Docker/ContainerActionBar';
import DockerTable from '~/modules/Docker/DockerTable';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

export default function DockerPage({
  dockerIsConfigured,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [selection, setSelection] = useState<ContainerInfo[]>([]);
  const { data, refetch, isRefetching } = api.docker.containers.useQuery(undefined, {
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
  const dockerIsConfigured = env.DOCKER_HOST !== undefined;

  const session = await getServerAuthSession({ req, res });
  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    [...boardNamespaces, 'layout/manage', 'tools/docker'],
    locale,
    req,
    res
  );
  return {
    props: {
      dockerIsConfigured: dockerIsConfigured,
      ...translations,
    },
  };
};
