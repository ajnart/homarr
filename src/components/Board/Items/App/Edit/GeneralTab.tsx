import { Stack, Tabs, Text, TextInput } from '@mantine/core';
import { IconClick, IconCursorText, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { AppForm } from '../EditAppModal';

interface GeneralTabProps {
  form: AppForm;
}

export const GeneralTab = ({ form }: GeneralTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  return (
    <Tabs.Panel value="general" pt="sm">
      <Stack spacing="xs">
        <TextInput
          icon={<IconCursorText size={16} />}
          label={t('general.appname.label')}
          description={t('general.appname.description')}
          placeholder="My example app"
          variant="default"
          withAsterisk
          {...form.getInputProps('name')}
        />
        <TextInput
          icon={<IconLink size={16} />}
          label={t('general.internalAddress.label')}
          description={t('general.internalAddress.description')}
          placeholder="https://google.com"
          variant="default"
          withAsterisk
          {...form.getInputProps('internalUrl')}
        />
        <TextInput
          icon={<IconClick size={16} />}
          label={t('general.externalAddress.label')}
          description={t('general.externalAddress.description')}
          placeholder="https://homarr.mywebsite.com/"
          variant="default"
          {...form.getInputProps('externalUrl')}
        />

        {form.values.externalUrl &&
          !form.values.externalUrl.startsWith('https://') &&
          !form.values.externalUrl.startsWith('http://') && (
            <Text color="red" mt="sm" size="sm">
              {t('behaviour.customProtocolWarning')}
            </Text>
          )}
      </Stack>
    </Tabs.Panel>
  );
};
