import { Tabs, Switch, MultiSelect } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { StatusCodes } from '../../../../../../tools/acceptableStatusCodes';
import { AppType } from '../../../../../../types/app';

interface NetworkTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const NetworkTab = ({ form }: NetworkTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  return (
    <Tabs.Panel value="network" pt="lg">
      <Switch
        label={t('network.statusChecker.label')}
        description={t('network.statusChecker.description')}
        mb="md"
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
          defaultValue={form.values.network.okStatus.map((x) => `${x}`)}
          variant="default"
          {...form.getInputProps('network.statusCodes')}
        />
      )}
    </Tabs.Panel>
  );
};
