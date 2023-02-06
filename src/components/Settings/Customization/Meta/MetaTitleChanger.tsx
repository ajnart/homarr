import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export const BrowserTabTitle = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { config, name: configName } = useConfigContext();
  const [metaTitle, setMetaTitle] = useState(config?.settings.customization.metaTitle ?? '');

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value } = ev.currentTarget;
    const metaTitle = value.trim();
    setMetaTitle(metaTitle);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          metaTitle,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('metaTitle.label')}
      description={t('metaTitle.description')}
      placeholder="homarr - the best dashboard"
      value={metaTitle}
      onChange={handleChange}
      mb="sm"
    />
  );
};
