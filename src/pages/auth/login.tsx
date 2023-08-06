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
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signInSchema } from '~/validations/user';

export default function LoginPage() {
  const { t } = useTranslation('authentication/login');
  const queryParams = useRouter().query as { error?: 'CredentialsSignin' | (string & {}) };
  const { i18nZodResolver } = useI18nZodResolver();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: i18nZodResolver(signInSchema),
  });

  const handleSubmit = (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    signIn('credentials', {
      redirect: false,
      name: values.name,
      password: values.password,
      callbackUrl: '/',
    }).then((response) => {
      if (!response?.ok) {
        setIsLoading(false);
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
        <Card withBorder shadow="md" p="xl" radius="md" w="90%" maw={420}>
          <Title align="center" weight={900}>
            {t('title')}
          </Title>

          <Text color="dimmed" size="sm" align="center" mt={5} mb="md">
            {t('text')}
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                variant="filled"
                label={t('form.fields.username.label')}
                withAsterisk
                {...form.getInputProps('name')}
              />

              <PasswordInput
                variant="filled"
                label={t('form.fields.password.label')}
                withAsterisk
                {...form.getInputProps('password')}
              />

              <Button fullWidth type="submit" loading={isLoading}>
                {t('form.buttons.submit')}
              </Button>

              {queryParams.error === 'CredentialsSignin' && (
                <Alert icon={<IconAlertTriangle size="1rem" />} color="red">
                  {t('alert')}
                </Alert>
              )}
            </Stack>
          </form>
        </Card>
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
