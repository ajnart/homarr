import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons-react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { ThemeSchemeToggle } from '~/components/ThemeSchemeToggle/ThemeSchemeToggle';
import { FloatingBackground } from '~/components/layout/Background/FloatingBackground';
import { env } from '~/env';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signInSchema } from '~/validations/user';

export default function LoginPage({
  redirectAfterLogin,
  isDemo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('authentication/login');
  const { i18nZodResolver } = useI18nZodResolver();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: i18nZodResolver(signInSchema),
  });

  const handleSubmit = (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setIsError(false);
    signIn('credentials', {
      redirect: false,
      name: values.name,
      password: values.password,
      callbackUrl: '/',
    }).then((response) => {
      if (!response?.ok) {
        setIsLoading(false);
        setIsError(true);
        return;
      }
      router.push(redirectAfterLogin ?? '/manage');
    });
  };

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Flex h="100dvh" display="flex" w="100%" direction="column" align="center" justify="center">
        <FloatingBackground />
        <ThemeSchemeToggle pos="absolute" top={20} right={20} />
        <Stack spacing={40} align="center" w="100%">
          <Stack spacing={0} align="center">
            <Image src="/imgs/logo/logo.svg" width={80} height={80} alt="" />
            <Text
              sx={(theme) => ({
                color: theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.dark[6],
                fontSize: '4rem',
                fontWeight: 800,
                lineHeight: 1,
              })}
              align="center"
            >
              Homarr
            </Text>
          </Stack>
          {isDemo && (
            <Alert title="Demo credentials">
              For demo purposes, you can login with the login <b>demo</b> and password :{' '}
              <b>demodemo</b>
            </Alert>
          )}
          <Card withBorder shadow="md" p="xl" radius="md" w="90%" maw={450}>
            <Title style={{ whiteSpace: 'nowrap' }} align="center" weight={900}>
              {t('title')}
            </Title>

            <Text color="dimmed" size="sm" align="center" mt={5} mb="md">
              {t('text')}
            </Text>

            {isError && (
              <Alert icon={<IconAlertTriangle size="1rem" />} color="red">
                {t('alert')}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  variant="filled"
                  label={t('form.fields.username.label')}
                  autoComplete="homarr-username"
                  withAsterisk
                  {...form.getInputProps('name')}
                />

                <PasswordInput
                  variant="filled"
                  label={t('form.fields.password.label')}
                  autoComplete="homarr-password"
                  withAsterisk
                  {...form.getInputProps('password')}
                />

                <Button mt="xs" variant="light" fullWidth type="submit" loading={isLoading}>
                  {t('form.buttons.submit')}
                </Button>

                {redirectAfterLogin && (
                  <Text color="dimmed" align="center" size="xs">
                    {t('form.afterLoginRedirection', { url: redirectAfterLogin })}
                  </Text>
                )}
              </Stack>
            </form>
          </Card>
        </Stack>
      </Flex>
    </>
  );
}

const regexExp = /^\/{1}[A-Za-z\/]*$/;

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res, query }) => {
  const session = await getServerAuthSession({ req, res });

  const zodResult = await z
    .object({ redirectAfterLogin: z.string().regex(regexExp) })
    .safeParseAsync(query);
  const redirectAfterLogin = zodResult.success ? zodResult.data.redirectAfterLogin : null;

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const isDemo = env.DEMO_MODE === 'true';

  return {
    props: {
      ...(await getServerSideTranslations(['authentication/login'], locale, req, res)),
      redirectAfterLogin,
      isDemo,
    },
  };
};
