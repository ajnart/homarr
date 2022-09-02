import React from 'react';
import { PasswordInput, Anchor, Paper, Title, Text, Container, Group, Button } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { showNotification, updateNotification } from '@mantine/notifications';
import axios from 'axios';
import { IconCheck, IconX } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// TODO: Add links to the wiki articles about the login process.
export default function AuthenticationTitle() {
  const router = useRouter();
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
          Welcome back!
        </Title>
      </Group>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Please enter the{' '}
        <Anchor<'a'> href="#" size="sm" onClick={(event) => event.preventDefault()}>
          password
        </Anchor>
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
              title: 'Checking your password',
              message: 'Your password is being checked...',
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
                      title: 'Password correct, redirecting you...',
                      message: undefined,
                      icon: <IconCheck />,
                      autoClose: 1000,
                    });
                  }
                  if (res.data.success === false) {
                    updateNotification({
                      id: 'load-data',
                      color: 'red',
                      title: 'Password is wrong, please try again.',
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
            label="Password"
            placeholder="Your password"
            required
            autoFocus
            mt="md"
            {...form.getInputProps('password')}
          />
          <Button fullWidth type="submit" mt="xl">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // Will be passed to the page component as props
    },
  };
}
