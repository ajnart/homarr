import {
  Alert,
  Button,
  Card,
  Flex,
  Group,
  PasswordInput,
  Stepper,
  Table,
  Text,
  Title,
} from '@mantine/core';
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

  const context = api.useContext();
  const { mutateAsync, isLoading } = api.user.createUser.useMutation({
    onSettled: () => {
      void context.user.getAll.invalidate();
    },
    onSuccess: () => {
      nextStep();
    },
  });

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
          icon={<IconKey />}
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
            <Title order={5}>Review your inputs</Title>
            <Text mb="xl">
              After you submit your data to the database, the user will be able to log in. Are you
              sure that you want to store this user in the database and activate the login?
            </Text>

            <Table mb="lg" withBorder highlightOnHover>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconUser size="1rem" />
                      <Text>Username</Text>
                    </Group>
                  </td>
                  <td>{form.values.account.username}</td>
                </tr>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconMail size="1rem" />
                      <Text>E-Mail</Text>
                    </Group>
                  </td>
                  <td>
                    {form.values.account.eMail ? (
                      <Text>{form.values.account.eMail}</Text>
                    ) : (
                      <Group spacing="xs">
                        <IconInfoCircle size="1rem" color="orange" />
                        <Text color="orange">Not set</Text>
                      </Group>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>
                    <Group spacing="xs">
                      <IconKey size="1rem" />
                      <Text>Password</Text>
                    </Group>
                  </td>
                  <td>
                    <Group spacing="xs">
                      <IconCheck size="1rem" color="green" />
                      <Text color="green">Valid</Text>
                    </Group>
                  </td>
                </tr>
              </tbody>
            </Table>

            <Flex justify="end" wrap="nowrap">
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
                Confirm
              </Button>
            </Flex>
          </Card>
        </Stepper.Step>
        <Stepper.Completed>
          <Alert title="User was created" color="green" mb="md">
            User has been created in the database. They can now log in.
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
              Create another
            </Button>
            <Button
              component={Link}
              leftIcon={<IconArrowLeft size="1rem" />}
              variant="default"
              href="/manage/users"
            >
              Go back to users
            </Button>
          </Group>
        </Stepper.Completed>
      </Stepper>
    </MainLayout>
  );
};

export default CreateNewUserPage;
