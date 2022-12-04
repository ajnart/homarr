import { Tabs, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCursorText, IconLink } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';

interface GeneralTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
}

export const GeneralTab = ({ form }: GeneralTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="general" pt="lg">
      <TextInput
        icon={<IconCursorText size={16} />}
        label="Service name"
        placeholder="My example service"
        variant="default"
        mb="md"
        required
        {...form.getInputProps('name')}
      />
      <TextInput
        icon={<IconLink size={16} />}
        label="Service url"
        placeholder="https://google.com"
        variant="default"
        required
        {...form.getInputProps('url')}
      />
    </Tabs.Panel>
  );
};
