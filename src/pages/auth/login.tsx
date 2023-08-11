import {
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
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { FloatingBackground } from '~/components/layout/Background/FloatingBackground';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signInSchema } from '~/validations/user';

export default function LoginPage() {
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
      router.push('/manage');
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

                <Button variant="light" fullWidth type="submit" mt="md" loading={isLoading}>
                  {t('form.buttons.submit')}
                </Button>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Flex>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await getServerSideTranslations(['authentication/login'], locale, req, res)),
    },
  };
};
