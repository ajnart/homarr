import { Text, Title } from '@mantine/core';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { CommonHeader } from '~/components/layout/common-header';

const SettingsPage = () => {
  return (
    <ManageLayout>
      <CommonHeader>
        <title>Settings • Homarr</title>
      </CommonHeader>

      <Title>Settings</Title>
      <Text>Coming soon!</Text>
    </ManageLayout>
  );
};

export default SettingsPage;
