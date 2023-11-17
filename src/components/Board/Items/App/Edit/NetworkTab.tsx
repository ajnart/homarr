import { MultiSelect, Stack, Switch, Tabs } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { statusCodeData } from '~/tools/acceptableStatusCodes';

import { type AppForm } from '../EditAppModal';

interface NetworkTabProps {
  form: AppForm;
}

export const NetworkTab = ({ form }: NetworkTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  const statusCodes = (form.values.statusCodes ?? [200]).map((x) => x.toString());
  return (
    <Tabs.Panel value="network" pt="lg">
      <Stack spacing="xs">
        <Switch
          label={t('network.statusChecker.label')}
          description={t('network.statusChecker.description')}
          styles={{ label: { fontWeight: 500 }, description: { marginTop: 0 } }}
          defaultChecked={form.values.isPingEnabled}
          {...form.getInputProps('isPingEnabled')}
        />
        {form.values.isPingEnabled && (
          <MultiSelect
            required
            label={t('network.statusCodes.label')}
            description={t('network.statusCodes.description')}
            data={statusCodeData}
            clearable
            searchable
            defaultValue={statusCodes}
            variant="default"
            {...form.getInputProps('statusCodes')}
            value={form.getInputProps('statusCodes').value.map((x: number) => x.toString())}
            onChange={(values) => {
              form.getInputProps('statusCodes').onChange(values.map((x) => parseInt(x, 10)));
            }}
          />
        )}
      </Stack>
    </Tabs.Panel>
  );
};
