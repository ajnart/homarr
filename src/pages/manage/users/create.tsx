import { Alert, Button, Card, Group, Stepper, Table, Text, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconArrowLeft,
  IconCheck,
  IconInfoCircle,
  IconKey,
  IconMail,
  IconMailCheck,
  IconUser,
  IconUserPlus,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import {
  CreateAccountStep,
  createAccountStepValidationSchema,
} from '~/components/Manage/User/Create/create-account-step';
import {
  CreateAccountSecurityStep,
  createAccountSecurityStepValidationSchema,
} from '~/components/Manage/User/Create/security-step';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { api } from '~/utils/api';
import { manageNamespaces } from '~/tools/server/translation-namespaces';

const CreateNewUserPage = () => {
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const form = useForm({
    initialValues: {
      account: {
        username: '',
        eMail: '',
      },
      security: {
        password: '',
      },
    },
    validate: zodResolver(
      z.object({
        account: createAccountStepValidationSchema,
        security: createAccountSecurityStepValidationSchema,
      })
    ),
  });

  const context = api.useContext();
  const { mutateAsync, isLoading } = api.user.create.useMutation({
    onSettled: () => {
      void context.user.all.invalidate();
    },
    onSuccess: () => {
      nextStep();
    },
  });

  const { t } = useTranslation('user/create');

  return (
    <ManageLayout>
      <Head>
        <title>Create user • Homarr</title>
      </Head>

      <Stepper active={active} onStepClick={setActive} breakpoint="sm" mih="100%">
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconUser />}
          label={t('steps.account.title')}
          description={t('steps.account.text')}
        >
          <CreateAccountStep
            defaultUsername={form.values.account.username}
            defaultEmail={form.values.account.eMail}
            nextStep={(value) => {
              form.setFieldValue('account', value);
              nextStep();
            }}
          />
        </Stepper.Step>
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconKey />}
          label={t('steps.security.title')}
          description={t('steps.security.text')}
        >
          <CreateAccountSecurityStep
            defaultPassword={form.values.security.password}
            nextStep={(value) => {
              form.setFieldValue('security', value);
              nextStep();
            }}
            prevStep={prevStep}
          />
        </Stepper.Step>
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconMailCheck />}
          label={t('steps.finish.title')}
          description={t('steps.finish.title')}
        >
          <Card mih={400}>
            <Title order={5}>{t('steps.finish.card.title')}</Title>
            <Text mb="xl">{t('steps.finish.card.text')}</Text>

            <Table mb="lg" withBorder highlightOnHover>
              <thead>
                <tr>
                  <th>{t('steps.finish.table.header.property')}</th>
                  <th>{t('steps.finish.table.header.value')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconUser size="1rem" />
                      <Text>{t('steps.finish.table.header.username')}</Text>
                    </Group>
                  </td>
                  <td>{form.values.account.username}</td>
                </tr>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconMail size="1rem" />
                      <Text>{t('steps.finish.table.header.email')}</Text>
                    </Group>
                  </td>
                  <td>
                    {form.values.account.eMail ? (
                      <Text>{form.values.account.eMail}</Text>
                    ) : (
                      <Group spacing="xs">
                        <IconInfoCircle size="1rem" color="orange" />
                        <Text color="orange">{t('steps.finish.table.notSet')}</Text>
                      </Group>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconKey size="1rem" />
                      <Text>{t('steps.finish.table.password')}</Text>
                    </Group>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <IconCheck size="1rem" color="green" />
                      <Text color="green">{t('steps.finish.table.valid')}</Text>
                    </Group>
                  </td>
                </tr>
              </tbody>
            </Table>

            <Group position="apart" noWrap>
              <Button
                leftIcon={<IconArrowLeft size="1rem" />}
                onClick={prevStep}
                variant="light"
                px="xl"
              >
                {t('buttons.previous')}
              </Button>
              <Button
                onClick={async () => {
                  await mutateAsync({
                    username: form.values.account.username,
                    password: form.values.security.password,
                    email: form.values.account.eMail === '' ? undefined : form.values.account.eMail,
                  });
                }}
                loading={isLoading}
                rightIcon={<IconCheck size="1rem" />}
                variant="light"
                px="xl"
              >
                {t('buttons.confirm')}
              </Button>
            </Group>
          </Card>
        </Stepper.Step>
        <Stepper.Completed>
          <Alert title="User was created" color="green" mb="md">
            {t('steps.finish.alertConfirmed')}
          </Alert>

          <Group>
            <Button
              onClick={() => {
                form.reset();
                setActive(0);
              }}
              leftIcon={<IconUserPlus size="1rem" />}
              variant="default"
            >
              {t('buttons.createAnother')}
            </Button>
            <Button
              component={Link}
              leftIcon={<IconArrowLeft size="1rem" />}
              variant="default"
              href="/manage/users"
            >
              {t('buttons.goBack')}
            </Button>
          </Group>
        </Stepper.Completed>
      </Stepper>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    undefined,
    undefined
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default CreateNewUserPage;
