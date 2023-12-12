import { Button, Group, Stack, TextInput, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { IntegrationType } from '~/server/db/items';
import { AppIntegrationType } from '~/types/app';

export function AddIntegrationPanel({}) {
  const { t } = useTranslation(['board/integrations', 'common']);
  const queryClient = useQueryClient();
  const { primaryColor } = useMantineTheme();

  const form = useForm<IntegrationType>({
    initialValues: 'jellyfin',
  });

  return (
    <form
      onSubmit={form.onSubmit((input) => {
        console.log(input);
        // if (!integration.type || !integrations) return null;
        // const newIntegrations = produce(integrations, (draft) => {
        //   integration.id = uuidv4();
        //   // console.log(integration.type);
        //   if (!integration.type) return;
        //   // If integration type is not in integrations, add it
        //   if (!draft[integration.type]) {
        //     draft[integration.type] = [];
        //   }
        //   draft[integration.type].push(integration);
        // });
        // // queryClient.setQueryData(queryKey, newIntegrations);
        // form.reset();
        // setIntegrations(newIntegrations);
        // notifications.show({
        //   title: t('integration.Added'),
        //   message: t('integration.AddedDescription', { name: integration.name }),
        //   color: 'green',
        // });
      })}
    >
      <Stack>
        <Group grow>
          <TextInput
            withAsterisk
            required
            label={'URL'}
            description={t('integration.urlDescription')}
            placeholder="http://localhost:3039"
            {...form.getInputProps('integration.url')}
          />
          <TextInput
            withAsterisk
            required
            label={t('integration.name')}
            description={t('integration.nameDescription')}
            placeholder="My integration"
            {...form.getInputProps('integration.name')}
          />
        </Group>
        <IntegrationTab form={form} />
        <Button type="submit" color={primaryColor} variant="light">
          {t('common:add')}
        </Button>
      </Stack>
    </form>
  );
}
