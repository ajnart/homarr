import { Title, Text } from '@mantine/core';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { CommonHeader } from '~/components/layout/common-header';

const SettingsPage = () => {
  return (
    <MainLayout>
      <CommonHeader>
        <title>Settings • Homarr</title>
      </CommonHeader>

      <Title>Settings</Title>
      <Text>Coming soon!</Text>
    </MainLayout>
  );
};

export default SettingsPage;
