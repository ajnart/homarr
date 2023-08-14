import {
  Box,
  Button,
  Card,
  Flex,
  Group,
  PasswordInput,
  Popover,
  Progress,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconDice,
  IconKey,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { minPasswordLength, passwordSchema } from '~/validations/user';

const requirements = [
  { re: /[0-9]/, label: 'number' },
  { re: /[a-z]/, label: 'lowercase' },
  { re: /[A-Z]/, label: 'uppercase' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'special' },
];

function getStrength(password: string) {
  let multiplier = password.length >= minPasswordLength ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
}

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
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ));

  const strength = getStrength(form.values.password);
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red';

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
          <Progress color={color} value={strength} size={5} mb="xs" />
          <PasswordRequirement
            label="length"
            meets={form.values.password.length >= minPasswordLength}
          />
          {checks}
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

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
  const { t } = useTranslation('manage/users/create');

  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size="0.9rem" /> : <IconX size="0.9rem" />}{' '}
      <Box ml={10}>
        {t(`steps.security.password.requirements.${label}`, {
          count: minPasswordLength,
        })}
      </Box>
    </Text>
  );
};

export const createAccountSecurityStepValidationSchema = z.object({
  password: passwordSchema,
});
