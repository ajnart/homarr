import { Alert, Button, Group, Stepper } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconKey, IconMailCheck, IconUser, IconUserPlus } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import {
  CreateAccountStep,
  createAccountStepValidationSchema,
} from '~/components/Manage/User/Create/create-account-step';
import { ReviewInputStep } from '~/components/Manage/User/Create/review-input-step';
import {
  CreateAccountSecurityStep,
  createAccountSecurityStepValidationSchema,
} from '~/components/Manage/User/Create/security-step';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';

const CreateNewUserPage = () => {
  const { t } = useTranslation('manage/users/create');
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));
  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<CreateAccountSchema>({
    initialValues: {
      account: {
        username: '',
        eMail: '',
      },
      security: {
        password: '',
      },
    },
    validate: i18nZodResolver(createAccountSchema),
  });

  const metaTitle = `${t('metaTitle')} • Homarr`;
  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
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
          <ReviewInputStep values={form.values} prevStep={prevStep} nextStep={nextStep} />
        </Stepper.Step>
        <Stepper.Completed>
          <Alert title={t('steps.completed.alert.title')} color="green" mb="md">
            {t('steps.completed.alert.text')}
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
              {t('common:back')}
            </Button>
          </Group>
        </Stepper.Completed>
      </Stepper>
    </ManageLayout>
  );
};

const createAccountSchema = z.object({
  account: createAccountStepValidationSchema,
  security: createAccountSecurityStepValidationSchema,
});

export type CreateAccountSchema = z.infer<typeof createAccountSchema>;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const result = checkForSessionOrAskForLogin(ctx, session, () => session?.user.isAdmin == true);
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    [...manageNamespaces, 'password-requirements'],
    ctx.locale,
    ctx.req,
    ctx.res
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default CreateNewUserPage;
