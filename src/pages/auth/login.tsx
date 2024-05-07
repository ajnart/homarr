import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertTriangle } from '@tabler/icons-react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { ThemeSchemeToggle } from '~/components/ThemeSchemeToggle/ThemeSchemeToggle';
import { FloatingBackground } from '~/components/layout/Background/FloatingBackground';
import { env } from '~/env';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signInSchema } from '~/validations/user';

const signInSchemaWithProvider = signInSchema.extend({ provider: z.string() });

export default function LoginPage({
  redirectAfterLogin,
  providers,
  oidcProviderName,
  oidcAutoLogin,
  isDemo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation('authentication/login');
  const { i18nZodResolver } = useI18nZodResolver();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const hasCredentialsInput = providers.includes('credentials') || providers.includes('ldap');

  const form = useForm<z.infer<typeof signInSchemaWithProvider>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: i18nZodResolver(signInSchemaWithProvider),
    initialValues: { name: '', password: '', provider: '' },
  });

  const handleSubmit = (values: z.infer<typeof signInSchemaWithProvider>) => {
    setIsLoading(true);
    setIsError(false);
    signIn(values.provider, {
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

  useEffect(() => {
    if (oidcAutoLogin && !isError)
      signIn('oidc', {
        redirect: false,
        callbackUrl: '/',
      }).then((response) => {
        if (!response?.ok) {
          setIsError(true);
        }
      });
  }, [oidcAutoLogin]);

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
          {oidcAutoLogin ? (
            <Card withBorder shadow="md" p="xl" radius="md" w="90%" maw={450}>
              <Text size="lg" align="center" m="md">
                Signing in with OIDC provider
              </Text>
            </Card>
          ) : (
            <Card withBorder shadow="md" p="xl" radius="md" w="90%" maw={450}>
              <Title style={{ whiteSpace: 'nowrap' }} align="center" weight={900}>
                {t('title')}
              </Title>

              {(providers.length < 1 && (
                <Alert
                  icon={<IconAlertTriangle size="1rem" />}
                  title={t('form.providersEmpty.title')}
                  mt={5}
                >
                  {t('form.providersEmpty.message')}
                </Alert>
              )) || (
                <Text color="dimmed" size="sm" align="center" mt={5} mb="md">
                  {t('text')}
                </Text>
              )}

              {isError && (
                <Alert icon={<IconAlertTriangle size="1rem" />} color="red">
                  {t('alert')}
                </Alert>
              )}
              {hasCredentialsInput && (
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

                    {providers.includes('credentials') && (
                      <Button
                        mt="xs"
                        variant="light"
                        fullWidth
                        type="submit"
                        disabled={isLoading && form.values.provider != 'credentials'}
                        loading={isLoading && form.values.provider == 'credentials'}
                        name="credentials"
                        onClick={() => form.setFieldValue('provider', 'credentials')}
                      >
                        {t('form.buttons.submit')}
                      </Button>
                    )}

                    {providers.includes('ldap') && (
                      <Button
                        mt="xs"
                        variant="light"
                        fullWidth
                        type="submit"
                        disabled={isLoading && form.values.provider != 'ldap'}
                        loading={isLoading && form.values.provider == 'ldap'}
                        name="ldap"
                        onClick={() => form.setFieldValue('provider', 'ldap')}
                      >
                        {t('form.buttons.submit')} - LDAP
                      </Button>
                    )}

                    {redirectAfterLogin && (
                      <Text color="dimmed" align="center" size="xs">
                        {t('form.afterLoginRedirection', { url: redirectAfterLogin })}
                      </Text>
                    )}
                  </Stack>
                </form>
              )}
              {hasCredentialsInput && providers.includes('oidc') && (
                <Divider label="OIDC" labelPosition="center" mt="xl" mb="md" />
              )}
              {providers.includes('oidc') && (
                <Button
                  mt="xs"
                  variant="light"
                  fullWidth
                  onClick={() =>
                    signIn('oidc', {
                      redirect: false,
                      callbackUrl: '/',
                    })
                  }
                >
                  {t('form.buttons.submit')} - {oidcProviderName}
                </Button>
              )}
            </Card>
          )}
        </Stack>
      </Flex>
    </>
  );
}

const regexExp = /^\/{1}[A-Za-z\/]*$/;

export const getServerSideProps = async ({
  locale,
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
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
      providers: env.AUTH_PROVIDER,
      oidcProviderName: env.AUTH_OIDC_CLIENT_NAME || null,
      oidcAutoLogin: env.AUTH_OIDC_AUTO_LOGIN || null,
      isDemo,
    },
  };
};
