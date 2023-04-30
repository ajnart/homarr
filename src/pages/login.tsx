import {
  Anchor,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { getServerAuthSession } from '../server/auth';
import { getInputPropsMiddleware } from '../tools/getInputPropsMiddleware';
import { getServerSideTranslations } from '../tools/server/getServerSideTranslations';
import { loginNamespaces } from '../tools/server/translation-namespaces';
import { ILogin, loginSchema } from '../validation/auth';

const Login: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ errorType }) => {
  const { t } = useTranslation('authentication/login');
  const router = useRouter();
  const { onSubmit, getInputProps } = useForm<ILogin>({
    validate: zodResolver(loginSchema),
  });

  const handleSubmit = async (data: ILogin) => {
    showNotification({
      id: 'login',
      title: t('notifications.checking.title'),
      message: t('notifications.checking.message'),
      loading: true,
    });
    const result = await signIn('credentials', {
      ...data,
      redirect: false,
    }).catch(() => null);

    if (!result?.ok) {
      updateNotification({
        id: 'login',
        title: t('notifications.wrong.title'),
        message: t('notifications.wrong.message'),
        color: 'red',
        icon: <IconX size={16} />,
      });
    } else {
      updateNotification({
        id: 'login',
        title: t('notifications.correct.title'),
        message: t('notifications.correct.message'),
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      router.push('/');
    }
  };

  return (
    <Center h="100vh">
      <Card p="lg" w="100%" maw={420} withBorder>
        <form onSubmit={onSubmit(handleSubmit)}>
          <Stack>
            <Stack align="center">
              <Title>{t('title')}</Title>
              <Text color="dimmed" size="sm">
                {t('text')}
              </Text>
            </Stack>

            <TextInput
              {...getInputPropsMiddleware(getInputProps('username'))}
              withAsterisk
              label={t('form.fields.username.label')}
              placeholder={t('form.fields.username.placeholder')}
            />
            <PasswordInput
              {...getInputPropsMiddleware(getInputProps('password'))}
              withAsterisk
              label={t('form.fields.password.label')}
              placeholder={t('form.fields.password.placeholder')}
            />

            <Button fullWidth type="submit">
              {t('form.buttons.submit')}
            </Button>

            <Anchor color="dimmed" align="center" component="button" type="button">
              {t('form.links.register')}
            </Anchor>
          </Stack>
        </form>
      </Card>
    </Center>
  );
};

export const getServerSideProps: GetServerSideProps<{
  errorType?: string | string[] | null;
}> = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const errorType = context.query.error ?? null;

  const translations = await getServerSideTranslations(
    loginNamespaces,
    context.locale,
    context.req,
    context.res
  );

  return { props: { errorType, ...translations } };
};

export default Login;
