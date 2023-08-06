import {
  Box,
  Button,
  Card,
  Center,
  Flex,
  Grid,
  Group,
  Image,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import { IconLayoutDashboard, IconUserCog } from '@tabler/icons-react';
import { IconArrowRight, IconBook2, IconUserPlus } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
import { z } from 'zod';
import { prisma } from '~/server/db';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

const getStepContents = () => [FirstStepContent, SecondStepContent, ThirdStepContent] as const;

export default function OnboardPage() {
  const { fn, colors, breakpoints, colorScheme } = useMantineTheme();
  const [currentStep, setStep] = useState(0);
  const next = () => setStep((prev) => prev + 1);
  const isSmallerThanMd = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const stepContents = useMemo(() => getStepContents(), []);
  const CurrentStepComponent = useMemo(() => stepContents[currentStep], [currentStep]);
  const background = colorScheme === 'dark' ? 'dark.6' : 'gray.1';

  return (
    <Stack h="100dvh" bg={background} spacing={0}>
      <Center bg={fn.linearGradient(145, colors.red[7], colors.red[5])} h="35%">
        <Center bg={background} w={128} h={128} style={{ borderRadius: 64 }}>
          <Image width={96} src="/imgs/logo/logo-color.svg" alt="Homarr Logo" />
        </Center>
      </Center>
      <Stack spacing="xl" p="md" align="center">
        <Group>
          {stepContents.map((_, index) => (
            <Step
              key={index}
              isCurrent={currentStep === index}
              isMobile={isSmallerThanMd}
              isDark={colorScheme === 'dark'}
            />
          ))}
        </Group>
        <CurrentStepComponent isMobile={isSmallerThanMd} next={next} />
      </Stack>
    </Stack>
  );
}

type StepProps = {
  isCurrent: boolean;
  isMobile: boolean;
  isDark: boolean;
};
const Step = ({ isCurrent, isMobile, isDark }: StepProps) => {
  return (
    <Box
      h={isMobile ? 16 : 20}
      w={isMobile ? 16 : 20}
      bg={isCurrent ? 'red.6' : isDark ? 'dark.3' : 'gray.4'}
      style={{ borderRadius: 10 }}
    ></Box>
  );
};

type StepContentComponent = (props: { isMobile: boolean; next: () => void }) => ReactNode;

const FirstStepContent: StepContentComponent = ({ isMobile, next }) => {
  return (
    <>
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
    </>
  );
};

const SecondStepContent: StepContentComponent = ({ isMobile, next }) => {
  const { mutateAsync, isLoading } = api.user.createAdminAccount.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    validate: i18nZodResolver(signUpFormSchema),
    validateInputOnBlur: true,
  });
  const handleSubmit = (values: z.infer<typeof signUpFormSchema>) => {
    void mutateAsync(values, {
      onSuccess: () => {
        next();
      },
    });
  };

  return (
    <>
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
          <Button mt="sm" fullWidth type="submit" loading={isLoading}>
            Continue
          </Button>
        </Stack>
      </form>
    </>
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
    href: '/users/invite',
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
    <>
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
    </>
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

  const translations = await getServerSideTranslations([], ctx.locale, ctx.req, ctx.res);

  return {
    props: {
      ...translations,
    },
  };
};
