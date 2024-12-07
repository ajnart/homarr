import { Alert, Button, Checkbox, Input, Stack, Text, Title } from '@mantine/core';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { api } from '~/utils/api';

/**
 * 1. Send selected options to the server
 * 2. Create a download token and send it back to the client
 * 3. Client downloads the ZIP file
 * 4. Client downloads the encryption key
 */

const ManagementPage = () => {
  const metaTitle = `Migration • Homarr`;
  const { mutateAsync } = api.migrate.createToken.useMutation();
  const [options, setOptions] = useState({
    boards: true,
    integrations: true,
    users: true,
  });
  const onClick = async () => {
    await mutateAsync(options, {
      onSuccess: (token) => {
        console.log(token);

        // Download ZIP file
        const link = document.createElement('a');
        const baseUrl = window.location.origin;
        link.href = `${baseUrl}/api/migrate?token=${token}`;
        console.log(link.href);
        link.download = 'migration.zip';
        link.click();
      },
    });
  };

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

        <Input.Wrapper label="Select everything you want to export">
          <Stack ml="md" mt="md">
            <Checkbox
              label="Export boards"
              checked={options.boards}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  boards: event.target.checked,
                  integrations: false,
                }))
              }
            />
            <Checkbox
              label="Export integrations"
              disabled={!options.boards}
              checked={options.integrations}
              onChange={(event) =>
                setOptions((prev) => ({ ...prev, integrations: event.target.checked }))
              }
              description="This will include encrypted credentials for integrations. Only available when exporting boards"
            />
            <Checkbox
              label="Export users"
              checked={options.users}
              onChange={(event) => setOptions((prev) => ({ ...prev, users: event.target.checked }))}
              description="This will only export credential users, passwords hash and salt are encrypted"
            />
          </Stack>
        </Input.Wrapper>

        <Button onClick={onClick}>Export</Button>
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
