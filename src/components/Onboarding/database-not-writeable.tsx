import { Center, Code, List, Stack, Text, Title } from '@mantine/core';
import Head from 'next/head';

export const DatabaseNotWriteable = ({
  stringifiedError,
  errorMessage,
}: {
  stringifiedError: string | undefined;
  errorMessage: string | undefined;
}) => {
  return (
    <>
      <Head>
        <title>Onboard - Error • Homarr</title>
      </Head>

      <Center h="100%">
        <Stack align="center" p="lg">
          <Title order={1} weight={800} size="3rem" opacity={0.8}>
            Critical error while starting Homarr
          </Title>
          <Text size="lg" mb={40}>
            We detected that Homarr is unable to write to the database. Please troubleshoot using
            the following steps:
          </Text>
          <List>
            <List.Item>
              Ensure that you mounted the path <code>/data</code> to a writeable location with
              enough disk space. For this, you must add the following mounting point to your docker
              compose: <Code block>{'      - <your-path>/data:/data'}</Code>
            </List.Item>
            <List.Item>
              Ensure that you followed the installation instructions at{' '}
              <a href="https://homarr.dev/docs/getting-started/installation">
                https://homarr.dev/docs/getting-started/installation
              </a>
            </List.Item>
          </List>
          <Code block>{stringifiedError}</Code>

          {errorMessage && <Code block>{errorMessage}</Code>}
        </Stack>
      </Center>
    </>
  );
};
