import { Button, Card, Group, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

import { PasswordRequirements } from '../Password/password-requirements';
import { OnboardingStepWrapper } from './common-wrapper';

export const StepCreateAccount = ({
  previous,
  next,
}: {
  previous: () => void;
  next: () => void;
}) => {
  const [isSigninIn, setIsSigninIn] = useState(false);
  const { mutateAsync } = api.user.createOwnerAccount.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    initialValues: {
      password: '',
      username: '',
      passwordConfirmation: '',
    },
    validate: i18nZodResolver(signUpFormSchema),
    validateInputOnBlur: true,
  });
  const handleSubmit = (values: z.infer<typeof signUpFormSchema>) => {
    setIsSigninIn(true);
    void mutateAsync(values, {
      onSuccess: () => {
        signIn('credentials', {
          redirect: false,
          name: values.username,
          password: values.password,
          callbackUrl: '/',
        }).then((response) => {
          if (!response?.ok) {
            setIsSigninIn(false);
            return;
          }
          next();
        });
      },
    });
  };

  return (
    <OnboardingStepWrapper>
      <Title order={2} align="center" mb="md">
        Create your administrator account
      </Title>
      <Text>
        Your administrator account <b>must be secure</b>, that's why we have so many rules
        surrounding it.
        <br />
        Try not to make it adminadmin this time...
        <br />
        Note: these password requirements <b>are not forced</b>, they are just recommendations.
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            size="md"
            w="100%"
            label="Username"
            variant="filled"
            withAsterisk
            {...form.getInputProps('username')}
          />

          <PasswordInput
            size="md"
            w="100%"
            label="Password"
            variant="filled"
            withAsterisk
            {...form.getInputProps('password')}
          />

          <Card mb="lg" withBorder>
            <PasswordRequirements value={form.values.password} />
          </Card>

          <PasswordInput
            size="md"
            w="100%"
            label="Confirm password"
            variant="filled"
            withAsterisk
            {...form.getInputProps('passwordConfirmation')}
          />
          <Group grow>
            <Button onClick={previous} leftIcon={<IconArrowLeft size="0.9rem" />} variant="default">
              Back
            </Button>
            <Button
              rightIcon={<IconArrowRight size="0.9rem" />}
              disabled={!form.isValid()}
              type="submit"
              loading={isSigninIn}
            >
              Continue
            </Button>
          </Group>
        </Stack>
      </form>
    </OnboardingStepWrapper>
  );
};
