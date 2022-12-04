import { Tabs, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconPhoto } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';

interface AppearanceTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

export const AppearanceTab = ({ form }: AppearanceTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="appearance" pt="lg">
      <TextInput
        icon={<IconPhoto />}
        label="Service Icon"
        variant="default"
        defaultValue={form.values.appearance.iconUrl}
        {...form.getInputProps('serviceIcon')}
      />
    </Tabs.Panel>
  );
};
