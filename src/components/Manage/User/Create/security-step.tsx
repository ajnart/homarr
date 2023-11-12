import { Button, Card, Flex, Group, PasswordInput, Popover } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconArrowRight, IconDice, IconKey } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { PasswordRequirements } from '~/components/Password/password-requirements';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { passwordSchema } from '~/validations/user';

interface CreateAccountSecurityStepProps {
  defaultPassword: string;
  nextStep: ({ password }: { password: string }) => void;
  prevStep: () => void;
}

export const CreateAccountSecurityStep = ({
  defaultPassword,
  nextStep,
  prevStep,
}: CreateAccountSecurityStepProps) => {
  const { t } = useTranslation('manage/users/create');

  const { i18nZodResolver } = useI18nZodResolver();
  const form = useForm({
    initialValues: {
      password: defaultPassword,
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
    validate: i18nZodResolver(createAccountSecurityStepValidationSchema),
  });

  const { mutateAsync, isLoading } = api.password.generate.useMutation();

  const [popoverOpened, setPopoverOpened] = useState(false);

  return (
    <Card mih={400}>
      <Popover
        opened={popoverOpened}
        position="bottom"
        width="target"
        transitionProps={{ transition: 'pop' }}
      >
        <Popover.Target>
          <div
            onFocusCapture={() => setPopoverOpened(true)}
            onBlurCapture={() => setPopoverOpened(false)}
          >
            <Flex columnGap={10} align="start">
              <PasswordInput
                icon={<IconKey size="0.8rem" />}
                style={{
                  flexGrow: 1,
                }}
                label={t('steps.security.password.label')}
                variant="filled"
                mb="md"
                withAsterisk
                {...form.getInputProps('password')}
              />
              <Button
                leftIcon={<IconDice size="1rem" />}
                onClick={async () => {
                  const randomPassword = await mutateAsync();
                  form.setFieldValue('password', randomPassword);
                  umami.track('Generate random password');
                }}
                loading={isLoading}
                variant="default"
                mt="xl"
              >
                {t('buttons.generateRandomPassword')}
              </Button>
            </Flex>
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <PasswordRequirements value={form.values.password} />
        </Popover.Dropdown>
      </Popover>

      <Group position="apart" noWrap>
        <Button leftIcon={<IconArrowLeft size="1rem" />} onClick={prevStep} variant="light" px="xl">
          {t('common:previous')}
        </Button>
        <Button
          rightIcon={<IconArrowRight size="1rem" />}
          onClick={() => {
            nextStep({
              password: form.values.password,
            });
          }}
          variant="light"
          px="xl"
          disabled={!form.isValid()}
        >
          {t('common:next')}
        </Button>
      </Group>
    </Card>
  );
};

export const createAccountSecurityStepValidationSchema = z.object({
  password: passwordSchema,
});
