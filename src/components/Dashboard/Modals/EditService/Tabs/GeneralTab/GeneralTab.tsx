import { Tabs, Text, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCursorText, IconLink } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ServiceType } from '../../../../../../types/service';
import { EditServiceModalTab } from '../type';

interface GeneralTabProps {
  form: UseFormReturnType<ServiceType, (values: ServiceType) => ServiceType>;
  openTab: (tab: EditServiceModalTab) => void;
}

export const GeneralTab = ({ form, openTab }: GeneralTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="general" pt="lg">
      <TextInput
        icon={<IconCursorText size={16} />}
        label="Service name"
        description="Used for displaying the service on the dashboard"
        placeholder="My example service"
        variant="default"
        mb="md"
        withAsterisk
        {...form.getInputProps('name')}
      />
      <TextInput
        icon={<IconLink size={16} />}
        label="Service url"
        description={
          <Text>
            URL that will be opened when clicking on the service. Can be overwritten using
            <Text
              onClick={() => openTab('behaviour')}
              variant="link"
              span
              style={{
                cursor: 'pointer',
              }}
            >
              {' '}
              on click URL{' '}
            </Text>
            when using external URLs to enhance security.
          </Text>
        }
        placeholder="https://google.com"
        variant="default"
        withAsterisk
        {...form.getInputProps('url')}
      />
    </Tabs.Panel>
  );
};
