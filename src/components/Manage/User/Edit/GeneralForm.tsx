import { Box, Button, Group, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { IconAt, IconCheck, IconLetterCase } from '@tabler/icons-react';
import { z } from 'zod';

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
  return (
    <Box maw={500}>
      <Title order={3}>
        General
      </Title>
      <form>
        <TextInput
          icon={<IconLetterCase size="1rem" />}
          label="Username"
          mb="md"
          withAsterisk
          {...form.getInputProps('username')}
        />
        <TextInput icon={<IconAt size="1rem" />} label="E-Mail" {...form.getInputProps('eMail')} />
      </form>
      <Group position="right" mt="md">
        <Button
          disabled={!form.isDirty() || !form.isValid()}
          leftIcon={<IconCheck size="1rem" />}
          color="green"
          variant="light"
        >
          Save
        </Button>
      </Group>
    </Box>
  );
};
