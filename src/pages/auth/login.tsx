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
import { useForm, zodResolver } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconAlertCircle, IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';
import { setCookie } from 'cookies-next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { CommonHeader } from '~/components/layout/common-header';
import { signInSchema } from '~/validations/user';

import { loginNamespaces } from '../../tools/server/translation-namespaces';

export default function LoginPage() {
  const { t } = useTranslation(['authentication/login']);
  const queryParams = useRouter().query as { error?: 'CredentialsSignin' | (string & {}) };

  const form = useForm<z.infer<typeof signInSchema>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: zodResolver(signInSchema),
  });

  const handleSubmit = (values: z.infer<typeof signInSchema>) => {
    signIn('credentials', {
      redirect: true,
      name: values.name,
      password: values.password,
      callbackUrl: '/',
    });
  };

  return (
    <Flex h="100dvh" display="flex" w="100%" direction="column" align="center" justify="center">
      <CommonHeader>
        <title>Login • Homarr</title>
      </CommonHeader>
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

            <Button fullWidth type="submit">
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
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, loginNamespaces)),
      // Will be passed to the page component as props
    },
  };
}
