import { Button, Card, Flex, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { signIn } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { z } from 'zod';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

const notificationId = 'register';

export default function AuthInvitePage() {
  const { t } = useTranslation('authentication/invite');
  const { i18nZodResolver } = useI18nZodResolver();
  const router = useRouter();
  const query = router.query as { token: string };
  const { mutateAsync } = api.user.createFromInvite.useMutation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: i18nZodResolver(signUpFormSchema),
  });

  const handleSubmit = (values: z.infer<typeof signUpFormSchema>) => {
    showNotification({
      id: notificationId,
      title: t('notifications.loading.title'),
      message: `${t('notifications.loading.text')}...`,
      loading: true,
    });
    setIsLoading(true);
    void mutateAsync(
      {
        ...values,
        inviteToken: query.token,
      },
      {
        onSuccess() {
          updateNotification({
            id: notificationId,
            title: t('notifications.success.title'),
            message: t('notifications.success.text'),
            color: 'teal',
            icon: <IconCheck />,
          });
          signIn('credentials', {
            redirect: false,
            name: values.username,
            password: values.password,
            callbackUrl: '/',
          }).then((response) => {
            if (!response?.ok) {
              // Redirect to login page if something went wrong
              router.push('/auth/login');
              return;
            }
            router.push('/manage');
          });
        },
        onError() {
          updateNotification({
            id: notificationId,
            title: t('notifications.error.title'),
            message: t('notifications.error.text'),
            color: 'red',
            icon: <IconX />,
          });
        },
      }
    );
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
                {...form.getInputProps('username')}
              />

              <PasswordInput
                variant="filled"
                label={t('form.fields.password.label')}
                withAsterisk
                {...form.getInputProps('password')}
              />

              <PasswordInput
                variant="filled"
                label={t('form.fields.passwordConfirmation.label')}
                withAsterisk
                {...form.getInputProps('passwordConfirmation')}
              />

              <Button fullWidth type="submit" loading={isLoading}>
                {t('form.buttons.submit')}
              </Button>
            </Stack>
          </form>
        </Card>
      </Flex>
    </>
  );
}

const queryParamsSchema = z.object({
  token: z.string(),
});
const routeParamsSchema = z.object({
  inviteId: z.string(),
});

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  req,
  res,
  query,
  params,
}) => {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const queryParams = queryParamsSchema.safeParse(query);
  const routeParams = routeParamsSchema.safeParse(params);

  if (!queryParams.success || !routeParams.success) {
    return {
      notFound: true,
    };
  }

  const token = await prisma.invite.findUnique({
    where: {
      id: routeParams.data.inviteId,
      token: queryParams.data.token,
    },
  });

  if (!token || token.expires < new Date()) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...(await getServerSideTranslations(['authentication/invite'], locale, req, res)),
    },
  };
};
