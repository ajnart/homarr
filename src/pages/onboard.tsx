import { Button, Center, Image, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowRight } from '@tabler/icons-react';
import Consola from 'consola';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { DatabaseNotWriteable } from '~/components/Onboarding/database-not-writeable';
import { OnboardingSteps } from '~/components/Onboarding/onboarding-steps';
import { ThemeSchemeToggle } from '~/components/ThemeSchemeToggle/ThemeSchemeToggle';
import { FloatingBackground } from '~/components/layout/Background/FloatingBackground';
import { env } from '~/env';
import { getTotalUserCountAsync } from '~/server/db/queries/user';
import { getConfig } from '~/tools/config/getConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';

export default function OnboardPage({
  configSchemaVersions,
  databaseNotWriteable,
  stringifiedError,
  errorMessage,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { fn, colors, colorScheme } = useMantineTheme();
  const background = colorScheme === 'dark' ? 'dark.6' : 'gray.1';

  const [onboardingSteps, { open: showOnboardingSteps }] = useDisclosure(false);

  const isUpgradeFromSchemaOne = configSchemaVersions.includes(1);

  return (
    <>
      <Head>
        <title>Onboard • Homarr</title>
      </Head>

      <FloatingBackground />

      <ThemeSchemeToggle pos="absolute" top={20} right={20} variant="default" />

      <Stack h="100dvh" bg={background} spacing={0}>
        <Center bg={fn.linearGradient(145, colors.red[7], colors.red[5])} mih={150} h={150}>
          <Center bg={background} w={100} h={100} style={{ borderRadius: 64 }}>
            <Image width={70} src="/imgs/logo/logo-color.svg" alt="Homarr Logo" />
          </Center>
        </Center>

        {databaseNotWriteable == true ? (
          <DatabaseNotWriteable stringifiedError={stringifiedError} errorMessage={errorMessage} />
        ) : (
          <>
            {onboardingSteps ? (
              <OnboardingSteps isUpdate={isUpgradeFromSchemaOne} />
            ) : (
              <Center h="100%">
                <Stack align="center" p="lg">
                  <Title order={1} weight={800} size="3rem" opacity={0.8}>
                    Welcome to Homarr!
                  </Title>
                  <Text size="lg" mb={40}>
                    Your favorite dashboard has received a big upgrade.
                    <br />
                    We'll help you update within the next few steps
                  </Text>

                  <Button
                    onClick={showOnboardingSteps}
                    rightIcon={<IconArrowRight size="1rem" />}
                    variant="default"
                  >
                    Start update process
                  </Button>
                </Stack>
              </Center>
            )}
          </>
        )}
      </Stack>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userCount = await getTotalUserCountAsync();
  if (userCount >= 1) {
    return {
      notFound: true,
    };
  }

  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
  const configs = files.map((file) => getConfig(file));
  const configSchemaVersions = configs.map((config) => config.schemaVersion);

  const translations = await getServerSideTranslations(
    ['password-requirements'],
    ctx.locale,
    ctx.req,
    ctx.res
  );

  if (env.DATABASE_URL.startsWith('file:')) {
    const rawDatabaseUrl = env.DATABASE_URL.substring('file:'.length);
    Consola.info(
      `Instance is using a database on the file system. Checking if file '${rawDatabaseUrl}' is writable...`
    );
    try {
      await fsPromises.access(rawDatabaseUrl, fs.constants.W_OK);
    } catch (error) {
      // this usually occurs when the database path is not mounted in Docker
      Consola.error(`Database '${rawDatabaseUrl}' is not writable.`, error);
      return {
        props: {
          ...translations,
          configSchemaVersions: configSchemaVersions,
          databaseNotWriteable: true,
          errorMessage: 'Database is not writeable',
          stringifiedError: JSON.stringify(error),
        },
      };
    }
    Consola.info('Database is writeable');
  }

  return {
    props: {
      ...translations,
      configSchemaVersions: configSchemaVersions,
      databaseNotWriteable: false,
    },
  };
};
