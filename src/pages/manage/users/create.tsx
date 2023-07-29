import { Button, Card, Flex, Group, Stepper, Text, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import {
  IconArrowRight,
  IconAt,
  IconCheck,
  IconLock,
  IconMailCheck,
  IconPremiumRights,
  IconSignRight,
  IconUser,
} from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { z } from 'zod';
import {
  CreateAccountStep,
  createAccountStepValidationSchema,
} from '~/components/Admin/CreateNewUser/create-account-step';
import {
  CreateAccountSecurityStep,
  createAccountSecurityStepValidationSchema,
} from '~/components/Admin/CreateNewUser/security-step';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { api } from '~/utils/api';

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

  const { mutateAsync, isSuccess } = api.user.createUser.useMutation();

  return (
    <MainLayout>
      <Head>
        <title>Create user • Homarr</title>
      </Head>

      <Stepper active={active} onStepClick={setActive} breakpoint="sm" mih="100%">
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconUser />}
          label="First step"
          description="Create account"
        >
          <CreateAccountStep
            nextStep={(value) => {
              form.setFieldValue('account', value);
              nextStep();
            }}
          />
        </Stepper.Step>
        <Stepper.Step
          allowStepClick={false}
          allowStepSelect={false}
          icon={<IconLock />}
          label="Second step"
          description="Password"
        >
          <CreateAccountSecurityStep
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
          label="Final step"
          description="Save to database"
        >
          <Card mih={400}>
            <Text>
              User creation has been prepared. Do you want to create the user and store it in the
              database?
            </Text>
            <Flex justify="end" wrap="nowrap">
              <Button
                onClick={async () => {
                  if (isSuccess) {
                    return;
                  }

                  await mutateAsync({
                    username: form.values.account.username,
                    password: form.values.security.password,
                    email: form.values.account.eMail === '' ? undefined : form.values.account.eMail,
                  });
                }}
                component={Link}
                href="/manage/users"
                rightIcon={<IconCheck size="1rem" />}
                variant="light"
                px="xl"
              >
                Finish
              </Button>
            </Flex>
          </Card>
        </Stepper.Step>
        <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
      </Stepper>
    </MainLayout>
  );
};

export default CreateNewUserPage;
