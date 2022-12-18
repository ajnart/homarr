import { Tabs, Switch, MultiSelect } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { StatusCodes } from '../../../../../../tools/acceptableStatusCodes';
import { AppType } from '../../../../../../types/app';

interface NetworkTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const NetworkTab = ({ form }: NetworkTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="network" pt="lg">
      <Switch
        label="Enable status checker"
        description="Sends a simple HTTP / HTTPS request to check if your app is online"
        mb="md"
        defaultChecked={form.values.network.enabledStatusChecker}
        {...form.getInputProps('network.enabledStatusChecker')}
      />
      {form.values.network.enabledStatusChecker && (
        <MultiSelect
          required
          label="HTTP status codes"
          description="Determines what response codes are allowed for this app to be 'Online'"
          data={StatusCodes}
          clearable
          searchable
          defaultValue={form.values.network.okStatus}
          variant="default"
          {...form.getInputProps('network.statusCodes')}
        />
      )}
    </Tabs.Panel>
  );
};
