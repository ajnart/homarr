import { Tabs, Switch } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { AppType } from '../../../../../../types/app';

interface BehaviourTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  return (
    <Tabs.Panel value="behaviour" pt="xs">
      <Switch
        label={t('behaviour.isOpeningNewTab.label')}
        description={t('behaviour.isOpeningNewTab.description')}
        {...form.getInputProps('behaviour.isOpeningNewTab', { type: 'checkbox' })}
      />
    </Tabs.Panel>
  );
};
