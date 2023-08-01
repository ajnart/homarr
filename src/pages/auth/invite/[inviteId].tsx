import { Button, Card, Flex, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { prisma } from '~/server/db';
import { inviteNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

export default function AuthInvitePage() {
  const { t } = useTranslation('authentication/invite');
  const { i18nZodResolver } = useI18nZodResolver();
  const router = useRouter();
  const query = router.query as { token: string };
  const { mutateAsync } = api.user.createFromInvite.useMutation();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: i18nZodResolver(signUpFormSchema),
  });

  const handleSubmit = (values: z.infer<typeof signUpFormSchema>) => {
    const notificationId = 'register';
    showNotification({
      id: notificationId,
      title: 'Creating account',
      message: 'Please wait...',
      loading: true,
    });
    void mutateAsync(
      {
        ...values,
        inviteToken: query.token,
      },
      {
        onSuccess() {
          updateNotification({
            id: notificationId,
            title: 'Account created',
            message: 'Your account has been created successfully',
            color: 'teal',
            icon: <IconCheck />,
          });
          router.push('/auth/login');
        },
        onError() {
          updateNotification({
            id: notificationId,
            title: 'Error',
            message: 'Something went wrong',
            color: 'red',
            icon: <IconX />,
          });
        },
      }
    );
  };

  return (
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

            <Button fullWidth type="submit">
              {t('form.buttons.submit')}
            </Button>
          </Stack>
        </form>
      </Card>
    </Flex>
  );
}

const queryParamsSchema = z.object({
  token: z.string(),
});
const routeParamsSchema = z.object({
  inviteId: z.string(),
});

export const getServerSideProps: GetServerSideProps = async ({ locale, query, params }) => {
  const queryParams = queryParamsSchema.safeParse(query);
  const routeParams = routeParamsSchema.safeParse(params);
  console.log(queryParams, routeParams);
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
      ...(await serverSideTranslations(locale ?? '', inviteNamespaces)),
    },
  };
};
