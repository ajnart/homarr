import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export const DashboardTitleChanger = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { config, name: configName } = useConfigContext();
  const [pageTitle, setPageTitle] = useState(config?.settings.customization.pageTitle ?? '');

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value } = ev.currentTarget;
    const pageTitle = value.trim();
    setPageTitle(pageTitle);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          pageTitle,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('pageTitle.label')}
      description={t('pageTitle.description')}
      placeholder="homarr"
      value={pageTitle}
      onChange={handleChange}
      mb="sm"
    />
  );
};
