import { Button, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { signUpFormSchema } from '~/validations/user';

import { OnboardingStepWrapper } from './common-wrapper';

export const StepCreateAccount = ({ next }: { next: () => void }) => {
  const [isSigninIn, setIsSigninIn] = useState(false);
  const { mutateAsync } = api.user.createOwnerAccount.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm<z.infer<typeof signUpFormSchema>>({
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
      <form
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <Stack>
          <TextInput
            size="md"
            w="100%"
            label="Username"
            withAsterisk
            {...form.getInputProps('username')}
          />

          <PasswordInput
            size="md"
            w="100%"
            label="Password"
            withAsterisk
            {...form.getInputProps('password')}
          />

          <PasswordInput
            size="md"
            w="100%"
            label="Confirm password"
            withAsterisk
            {...form.getInputProps('passwordConfirmation')}
          />
          <Button disabled={!form.isValid()} mt="sm" fullWidth type="submit" loading={isSigninIn}>
            Continue
          </Button>
        </Stack>
      </form>
    </OnboardingStepWrapper>
  );
};
