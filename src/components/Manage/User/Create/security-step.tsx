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
import { useForm, zodResolver } from '@mantine/form';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconDice,
  IconKey,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import { api } from '~/utils/api';
import { passwordSchema } from '~/validations/user';

const requirements = [
  { re: /[0-9]/, label: 'Includes number' },
  { re: /[a-z]/, label: 'Includes lowercase letter' },
  { re: /[A-Z]/, label: 'Includes uppercase letter' },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special symbol' },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

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
  const form = useForm({
    initialValues: {
      password: defaultPassword,
    },
    validateInputOnBlur: true,
    validateInputOnChange: true,
    validate: zodResolver(createAccountSecurityStepValidationSchema),
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

  const { t } = useTranslation('user/create');

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
                {t('buttons.generateRandomPw')}
              </Button>
            </Flex>
          </div>
        </Popover.Target>
        <Popover.Dropdown>
          <Progress color={color} value={strength} size={5} mb="xs" />
          <PasswordRequirement
            label={t('steps.security.password.requirement')}
            meets={form.values.password.length > 5}
          />
          {checks}
        </Popover.Dropdown>
      </Popover>

      <Group position="apart" noWrap>
        <Button leftIcon={<IconArrowLeft size="1rem" />} onClick={prevStep} variant="light" px="xl">
          {t('buttons.previous')}
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
          {t('buttons.next')}
        </Button>
      </Group>
    </Card>
  );
};

const PasswordRequirement = ({ meets, label }: { meets: boolean; label: string }) => {
  return (
    <Text
      color={meets ? 'teal' : 'red'}
      sx={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm"
    >
      {meets ? <IconCheck size="0.9rem" /> : <IconX size="0.9rem" />} <Box ml={10}>{label}</Box>
    </Text>
  );
};

export const createAccountSecurityStepValidationSchema = z.object({
  password: passwordSchema,
});
