import { Tabs, Text, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconCursorText, IconLink } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { AppType } from '../../../../../../types/app';
import { EditAppModalTab } from '../type';

interface GeneralTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  openTab: (tab: EditAppModalTab) => void;
}

export const GeneralTab = ({ form, openTab }: GeneralTabProps) => {
  const { t } = useTranslation('');
  return (
    <Tabs.Panel value="general" pt="lg">
      <TextInput
        icon={<IconCursorText size={16} />}
        label="App name"
        description="Used for displaying the app on the dashboard"
        placeholder="My example app"
        variant="default"
        mb="md"
        withAsterisk
        {...form.getInputProps('name')}
      />
      <TextInput
        icon={<IconLink size={16} />}
        label="App url"
        description={
          <Text>
            URL that will be opened when clicking on the app. Can be overwritten using
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
