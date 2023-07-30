import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ContextModalProps, modals } from '@mantine/modals';
import { getStaticFallbackConfig } from '~/tools/config/getFallbackConfig';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { createDashboardSchemaValidation } from '~/validations/dashboards';

export const CreateDashboardModal = ({ context, id, innerProps }: ContextModalProps<{}>) => {
  const apiContext = api.useContext();
  const { isLoading, mutateAsync } = api.config.save.useMutation({
    onSuccess: async () => {
      await apiContext.config.all.invalidate();
      modals.close(id);
    },
  });

  const { i18nZodResolver } = useI18nZodResolver();

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: i18nZodResolver(createDashboardSchemaValidation),
  });

  return (
    <Stack>
      <Text>A name cannot be changed after a dashboard has been created.</Text>

      <TextInput label="Name" withAsterisk {...form.getInputProps('name')} />

      <Group grow>
        <Button
          onClick={() => {
            modals.close(id);
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={async () => {
            const fallbackConfig = getStaticFallbackConfig(form.values.name);
            await mutateAsync({
              name: form.values.name,
              config: fallbackConfig,
            });
          }}
          disabled={isLoading}
        >
          Create
        </Button>
      </Group>
    </Stack>
  );
};
