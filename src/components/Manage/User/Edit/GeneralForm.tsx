import { Box, Button, Group, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAt, IconCheck, IconLetterCase } from '@tabler/icons-react';
import { z } from 'zod';
import { useTranslation } from 'next-i18next';

export const ManageUserGeneralForm = ({
  defaultUsername,
  defaultEmail,
}: {
  defaultUsername: string;
  defaultEmail: string;
}) => {
  const form = useForm({
    initialValues: {
      username: defaultUsername,
      eMail: defaultEmail,
    },
    validate: zodResolver(
      z.object({
        username: z.string(),
        eMail: z.string().optional(),
      })
    ),
    validateInputOnBlur: true,
    validateInputOnChange: true
  });
  const { t } = useTranslation(['manage/users/edit', 'common']);
  return (
    <Box maw={500}>
      <Title order={3}>
        {t('sections.general.title')}
      </Title>
      <form>
        <TextInput
          icon={<IconLetterCase size="1rem" />}
          label={t('sections.general.inputs.username.label')}
          mb="md"
          withAsterisk
          {...form.getInputProps('username')}
        />
        <TextInput icon={<IconAt size="1rem" />} label={t('sections.general.inputs.eMail.label')} {...form.getInputProps('eMail')} />
      </form>
      <Group position="right" mt="md">
        <Button
          disabled={!form.isDirty() || !form.isValid()}
          leftIcon={<IconCheck size="1rem" />}
          color="green"
          variant="light"
        >
          {t('common:save')}
        </Button>
      </Group>
    </Box>
  );
};
