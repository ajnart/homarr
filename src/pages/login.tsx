import React from 'react';
import { PasswordInput, Paper, Title, Text, Container, Group, Button } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { showNotification, updateNotification } from '@mantine/notifications';
import axios from 'axios';
import { IconCheck, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useForm } from '@mantine/form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { loginNamespaces } from '../tools/translation-namespaces';

// TODO: Add links to the wiki articles about the login process.
export default function AuthenticationTitle() {
  const router = useRouter();
  const { t } = useTranslation('authentication/login');

  const form = useForm({
    initialValues: {
      password: '',
    },
  });
  return (
    <Container
      size="lg"
      style={{
        height: '100vh',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Group>
        <Title
          align="center"
          sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
        >
          {t('title')}
        </Title>
      </Group>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        {t('text')}
      </Text>

      <Paper
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        style={{ width: '100%', maxWidth: 420 }}
      >
        <form
          onSubmit={form.onSubmit((values) => {
            setCookie('password', values.password, {
              maxAge: 60 * 60 * 24 * 30,
              sameSite: 'lax',
            });
            showNotification({
              id: 'load-data',
              loading: true,
              title: t('notifications.checking.title'),
              message: t('notifications.checking.message'),
              autoClose: false,
              disallowClose: true,
            });
            axios
              .post('/api/configs/tryPassword', {
                tried: values.password,
              })
              .then((res) => {
                setTimeout(() => {
                  if (res.data.success === true) {
                    router.push('/');
                    updateNotification({
                      id: 'load-data',
                      color: 'teal',
                      title: t('notifications.correct.title'),
                      message: undefined,
                      icon: <IconCheck />,
                      autoClose: 1000,
                    });
                  }
                  if (res.data.success === false) {
                    updateNotification({
                      id: 'load-data',
                      color: 'red',
                      title: t('notifications.wrong.title'),
                      message: undefined,
                      icon: <IconX />,
                      autoClose: 2000,
                    });
                  }
                }, 500);
              });
          })}
        >
          <PasswordInput
            id="password"
            label={t('form.fields.password.label')}
            placeholder={t('form.fields.password.placeholder')}
            required
            autoFocus
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth type="submit" mt="xl">
            {t('form.buttons.submit')}
          </Button>
        </form>
      </Paper>
    </Container>
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
