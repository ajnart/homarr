import {
  ActionIcon,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Pagination,
  Table,
  Text,
  Title,
  Tooltip,
	useMantineTheme,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconTrash, IconUserDown, IconUserUp } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { openRoleChangeModal } from '~/components/Manage/User/change-user-role.modal';
import { openDeleteUserModal } from '~/components/Manage/User/delete-user.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

import { AddIntegrationPanel } from './AddIntegrationPanel';
import { useQueryClient } from '@tanstack/react-query';
import { IntegrationTypeMap } from '~/types/config';
import { useConfigContext } from '~/config/provider';
import { useForm } from '@mantine/form';

const ManageUsersPage = () => {
  const [activePage, setActivePage] = useState(0);
  const [nonDebouncedSearch, setNonDebouncedSearch] = useState<string | undefined>('');
  const [debouncedSearch] = useDebouncedValue<string | undefined>(nonDebouncedSearch, 200);
  const { t } = useTranslation('manage/integrations');
  const queryClient = useQueryClient();
  const { primaryColor } = useMantineTheme();
  const integrationsQuery: IntegrationTypeMap | undefined = queryClient.getQueryData(queryKey);
  const mutation = api.config.save.useMutation();
  const { config, name } = useConfigContext();
  const [isLoading, setIsLoading] = useState(false);
	const { data: sessionData } = useSession();
  const [integrations, setIntegrations] = useState<IntegrationTypeMap | undefined>(
		integrationsQuery
  );

  if (!integrations) {
    return null;
  }

  const form = useForm({
    initialValues: integrationsQuery,
  });

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="md">{t('pageTitle')}</Title>
      <Text mb="xl">{t('text')}</Text>
      <AddIntegrationPanel
        globalForm={form}
        queryKey={queryKey}
        integrations={integrations}
        setIntegrations={setIntegrations}
      />
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    undefined,
    undefined
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default ManageUsersPage;
