import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import React, { useEffect } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import Head from 'next/head';
import { ActionIcon, Button, Group, Text, TextInput, Title, Tooltip, useMantineTheme } from '@mantine/core';
import { IconCopy, IconLockAccess } from '@tabler/icons-react';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import Cookies from 'cookies';
import { getServerAuthSession } from '~/server/auth';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const SwaggerApiPage = ({ authenticationToken }: { authenticationToken: string }) => {
  const [accessTokenRevealed, { toggle: toggleAccessTokenReveal, close: hideAccessToken }] = useDisclosure(false);
  const clipboard = useClipboard({ timeout: 2500 });

  useEffect(() => {
    if (clipboard.copied) {
      return;
    }

    hideAccessToken();
  }, [clipboard.copied]);

  const theme = useMantineTheme();

  return <ManageLayout>
    <Head>
      <title>API • Homarr</title>
    </Head>

    <Title mb={'md'}>API</Title>
    <Text mb={'xl'}>Advanced users can use the API to interface with Homarr. The documentation is completely local,
      interactive
      and complies with the Open API standard. Any compatible client can import for easy usage.</Text>


    <Group>
      <Button onClick={toggleAccessTokenReveal} leftIcon={<IconLockAccess size={'1rem'} />} variant={'light'}>
        Show your personal access token
      </Button>
      {accessTokenRevealed && (
        <TextInput
          rightSection={
            <Tooltip opened={clipboard.copied} label={"Copied"}>
              <ActionIcon
                onClick={() => {
                  clipboard.copy(authenticationToken);
                }}>
                <IconCopy size={'1rem'} />
              </ActionIcon>
            </Tooltip>}
          value={authenticationToken} />
      )}
    </Group>

    <div data-color-scheme={theme.colorScheme} className={"open-api-container"}>
      <SwaggerUI url="/api/openapi.json" />
    </div>
  </ManageLayout>;
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {

  const session = await getServerAuthSession(ctx);
  const result = checkForSessionOrAskForLogin(ctx, session, () => true);
  if (result) {
    return result;
  }

  // Create a cookies instance
  const cookies = new Cookies(ctx.req, ctx.res);

  const authenticationToken = cookies.get('next-auth.session-token');

  return {
    props: {
      authenticationToken: authenticationToken,
      ...(await getServerSideTranslations(
        ['layout/manage', 'manage/index'],
        ctx.locale,
        ctx.req,
        ctx.res,
      )),
    },
  };
}

export default SwaggerApiPage;