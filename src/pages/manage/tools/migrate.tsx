import { Alert, Button, Checkbox, Group, Stack, Text, Title } from '@mantine/core';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';

/**
 * 1. Send selected options to the server
 * 2. Create a download token and send it back to the client
 * 3. Client downloads the ZIP file
 * 4. Client downloads the encryption key
 */

const ManagementPage = () => {
  const metaTitle = `Migration • Homarr`;
  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Stack>
        <Title order={1}>Migrate boards, integrations and users</Title>
        <Text>
          Exports your boards and users to a ZIP-Archive to migrate them to Homarr after version
          1.0.0
        </Text>

        <Alert color="blue" title="Security Note">
          When exporting users and integrations it will also download a file with an encryption key.
          This file is required to import the data into Homarr. Keep it safe and do not share it
          with anyone.
        </Alert>

        <Checkbox.Group label="Select everything you want to export">
          <Group>
            <Checkbox label="Export boards" />
            <Checkbox label="Export users" />
            <Checkbox label="Export integrations" />
          </Group>
        </Checkbox.Group>

        <Button>Export</Button>
      </Stack>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const result = checkForSessionOrAskForLogin(ctx, session, () => Boolean(session?.user.isAdmin));
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    ['layout/manage', 'manage/index'],
    ctx.locale,
    ctx.req,
    ctx.res
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default ManagementPage;
