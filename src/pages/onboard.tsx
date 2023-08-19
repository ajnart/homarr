import {
  Box,
  Button,
  Card,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  PasswordInput,
  Stack,
  Stepper,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconLayoutDashboard, IconUserCog } from '@tabler/icons-react';
import { IconArrowRight, IconBook2, IconUserPlus } from '@tabler/icons-react';
import fs from 'fs';
import { GetServerSideProps, GetServerSidePropsResult, InferGetServerSidePropsType } from 'next';
import { signIn } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import { z } from 'zod';
import { OnboardingSteps } from '~/components/Onboarding/onboarding-steps';
import { prisma } from '~/server/db';
import { getConfig } from '~/tools/config/getConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

export default function OnboardPage({
  configSchemaVersions,
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

      <Stack h="100dvh" bg={background} spacing={0}>
        <Center bg={fn.linearGradient(145, colors.red[7], colors.red[5])} h={175}>
          <Center bg={background} w={100} h={100} style={{ borderRadius: 64 }}>
            <Image width={70} src="/imgs/logo/logo-color.svg" alt="Homarr Logo" />
          </Center>
        </Center>

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
      </Stack>
    </>
  );
}

type StepContentComponent = (props: { isMobile: boolean; next: () => void }) => ReactNode;

const FirstStepContent: StepContentComponent = ({ isMobile, next }) => {
  return (
    <Stepper.Step label="First step" description="Create an account">
      <Stack spacing={4} align="center">
        <Title order={isMobile ? 3 : 1}>Hi there!</Title>
        <Title order={isMobile ? 3 : 1}>Welcome to Homarr! 👋</Title>
      </Stack>
      <Text color="dimmed" size="lg" align="center">
        Before you can use Homarr, you need to configure a few things.
      </Text>
      <Button onClick={next} size="lg" mt="sm" w={400} maw="90%">
        Start configuration
      </Button>
    </Stepper.Step>
  );
};

const SecondStepContent: StepContentComponent = ({ isMobile, next }) => {
  const [isSigninIn, setIsSigninIn] = useState(false);
  const { mutateAsync } = api.user.createOwnerAccount.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    validate: i18nZodResolver(signUpFormSchema),
    validateInputOnBlur: true,
  });
  const handleSubmit = (values: z.infer<typeof signUpFormSchema>) => {
    setIsSigninIn(true);
    void mutateAsync(values, {
      onSuccess: () => {
        signIn('credentials', {
          redirect: false,
          name: values.username,
          password: values.password,
          callbackUrl: '/',
        }).then((response) => {
          if (!response?.ok) {
            setIsSigninIn(false);
            return;
          }
          next();
        });
      },
    });
  };

  return (
    <Stepper.Step label="Second step" description="Create an account">
      <Title order={isMobile ? 3 : 1}>Configure your credentials</Title>
      <form
        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <Stack w={400} maw="90%" spacing="sm" align="center">
          <TextInput
            size="md"
            w="100%"
            label="Username"
            withAsterisk
            {...form.getInputProps('username')}
          />

          <PasswordInput
            size="md"
            w="100%"
            label="Password"
            withAsterisk
            {...form.getInputProps('password')}
          />

          <PasswordInput
            size="md"
            w="100%"
            label="Confirm password"
            withAsterisk
            {...form.getInputProps('passwordConfirmation')}
          />
          <Button mt="sm" fullWidth type="submit" loading={isSigninIn}>
            Continue
          </Button>
        </Stack>
      </form>
    </Stepper.Step>
  );
};

const firstActions = [
  {
    icon: IconBook2,
    label: 'Read the documentation',
    href: 'https://homarr.dev/docs/introduction/after-the-installation',
  },
  {
    icon: IconUserPlus,
    label: 'Invite an user',
    href: '/manage/users/invites',
  },
  {
    icon: IconLayoutDashboard,
    label: 'Setup your board',
    href: '/board',
  },
  {
    icon: IconUserCog,
    label: 'Configure your profile',
    href: '/user/preferences',
  },
];

const ThirdStepContent: StepContentComponent = ({ isMobile, next }) => {
  const { breakpoints } = useMantineTheme();
  const { classes } = useStyles();

  return (
    <Stepper.Step label="Third step" description="Create an account">
      <Title order={isMobile ? 3 : 1}>Get started! 🚀</Title>
      <Grid w="100%" maw={breakpoints.sm} mt="xl">
        {firstActions.map((action) => (
          <Grid.Col key={action.label} sm={6}>
            <UnstyledButton component={Link} href={action.href} w="100%">
              <Card withBorder className={classes.button}>
                <Group position="apart">
                  <Group>
                    <action.icon size={isMobile ? 16 : 20} stroke={1.5} />
                    <Title order={isMobile ? 6 : 5}>{action.label}</Title>
                  </Group>

                  <IconArrowRight size={isMobile ? 16 : 20} stroke={1.5} />
                </Group>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        ))}
      </Grid>
    </Stepper.Step>
  );
};

const useStyles = createStyles((theme) => ({
  button: {
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
    },
  },
}));

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userCount = await prisma.user.count();
  if (userCount >= 1) {
    return {
      notFound: true,
    };
  }

  const files = fs.readdirSync('./data/configs').filter((file) => file.endsWith('.json'));
  const configs = files.map((file) => getConfig(file));
  const configSchemaVersions = configs.map((config) => config.schemaVersion);

  const translations = await getServerSideTranslations([], ctx.locale, ctx.req, ctx.res);

  return {
    props: {
      ...translations,
      configSchemaVersions: configSchemaVersions,
    },
  };
};
