import { Tabs, Text, TextInput } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { IconClick, IconCursorText, IconLink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { AppType } from '../../../../../../types/app';
import { EditAppModalTab } from '../type';

interface GeneralTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  openTab: (tab: EditAppModalTab) => void;
}

export const GeneralTab = ({ form, openTab }: GeneralTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');
  return (
    <Tabs.Panel value="general" pt="sm">
      <TextInput
        icon={<IconCursorText size={16} />}
        label={t('general.appname.label')}
        description={t('general.appname.description')}
        placeholder="My example app"
        variant="default"
        withAsterisk
        mb="md"
        {...form.getInputProps('name')}
      />
      <TextInput
        icon={<IconLink size={16} />}
        label={t('general.internalAddress.label')}
        description={t('general.internalAddress.description')}
        placeholder="https://google.com"
        variant="default"
        withAsterisk
        mb="md"
        {...form.getInputProps('url')}
      />
      <TextInput
        icon={<IconClick size={16} />}
        label={t('general.externalAddress.label')}
        description={t('general.externalAddress.description')}
        placeholder="https://homarr.mywebsite.com/"
        variant="default"
        {...form.getInputProps('behaviour.externalUrl')}
      />

      {!form.values.behaviour.externalUrl.startsWith('https://') &&
        !form.values.behaviour.externalUrl.startsWith('http://') && (
          <Text color="red" mt="sm" size="sm">
            {t('behaviour.customProtocolWarning')}
          </Text>
        )}
    </Tabs.Panel>
  );
};
