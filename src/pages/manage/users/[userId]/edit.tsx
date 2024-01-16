import { Avatar, Divider, Group, Loader, Stack, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ManageUserGeneralForm } from '~/components/Manage/User/Edit/GeneralForm';
import { ManageUserDanger } from '~/components/Manage/User/Edit/ManageUserDanger';
import { ManageUserSecurityForm } from '~/components/Manage/User/Edit/ManageUserSecurityForm';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';
import { ManageUserRoles } from '~/components/Manage/User/Edit/ManageUserRoles';

const EditPage = () => {
  const { t } = useTranslation('manage/users/edit');

  const router = useRouter();

  const { data } = api.user.details.useQuery({ userId: router.query.userId as string });

  const metaTitle = `${t('metaTitle', {
    username: data?.name,
  })} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>
      <UnstyledButton component={Link} href='/manage/users'>
        <Group mb='md'>
          <ThemeIcon variant='default'>
            <IconArrowLeft size='1rem' />
          </ThemeIcon>
          <Text>{t('back')}</Text>
        </Group>
      </UnstyledButton>

      <Group mb='xl'>
        <Avatar>{data?.name?.slice(0, 2).toUpperCase()}</Avatar>
        <Title>{data?.name}</Title>
      </Group>

      {data ? (
        <Stack>
          <ManageUserGeneralForm
            defaultUsername={data?.name ?? ''}
            defaultEmail={data?.email ?? ''}
            userId={data.id}
          />
          <Divider />
          <ManageUserSecurityForm userId={data.id} />
          <Divider />
          <ManageUserRoles user={data} />
          <Divider />
          <ManageUserDanger userId={data.id} username={data.name} />
        </Stack>
      ) : (
        <Loader />
      )}
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const result = checkForSessionOrAskForLogin(ctx, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    undefined,
    undefined,
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default EditPage;
