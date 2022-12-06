import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

interface FaviconChangerProps {
  defaultValue: string | undefined;
}

export const FaviconChanger = ({ defaultValue }: FaviconChangerProps) => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();
  const [faviconUrl, setFaviconUrl] = useState(defaultValue);

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value } = ev.currentTarget;
    const faviconUrl = value.trim().length === 0 ? undefined : value;
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
      placeholder="/imgs/favicon/favicon.svg"
      value={faviconUrl}
      onChange={handleChange}
    />
  );
};
