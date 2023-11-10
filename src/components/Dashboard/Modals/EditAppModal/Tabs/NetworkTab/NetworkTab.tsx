import { MultiSelect, Stack, Switch, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { StatusCodes } from '~/tools/acceptableStatusCodes';
import { AppType } from '~/types/app';

interface NetworkTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const NetworkTab = ({ form }: NetworkTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const acceptableStatusCodes = (form.values.network.statusCodes ?? ['200']).map((x) =>
    x.toString()
  );
  return (
    <Tabs.Panel value="network" pt="lg">
      <Stack spacing="xs">
        <Switch
          label={t('network.statusChecker.label')}
          description={t('network.statusChecker.description')}
          styles={{ label: { fontWeight: 500 }, description: { marginTop: 0 } }}
          defaultChecked={form.values.network.enabledStatusChecker}
          {...form.getInputProps('network.enabledStatusChecker')}
        />
        {form.values.network.enabledStatusChecker && (
          <MultiSelect
            required
            label={t('network.statusCodes.label')}
            description={t('network.statusCodes.description')}
            data={StatusCodes}
            clearable
            searchable
            defaultValue={acceptableStatusCodes}
            variant="default"
            {...form.getInputProps('network.statusCodes')}
          />
        )}
      </Stack>
    </Tabs.Panel>
  );
};
