import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export const FaviconChanger = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { config, name: configName } = useConfigContext();
  const [faviconUrl, setFaviconUrl] = useState(
    config?.settings.customization.faviconUrl ?? '/imgs/favicon/favicon-squared.png'
  );

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value } = ev.currentTarget;
    const faviconUrl = value.trim();
    setFaviconUrl(faviconUrl);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          faviconUrl,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('favicon.label')}
      description={t('favicon.description')}
      placeholder="/imgs/favicon/favicon.svg"
      value={faviconUrl}
      onChange={handleChange}
    />
  );
};
