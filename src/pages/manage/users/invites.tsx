import { Title } from '@mantine/core';
import { Head } from 'next/document';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';

const ManageUserInvitesPage = () => {
  return (
    <MainLayout>
      <Head>
        <title>User invites • Homarr</title>
      </Head>
      <Title>Manage user invites</Title>
    </MainLayout>
  );
};

export default ManageUserInvitesPage;
