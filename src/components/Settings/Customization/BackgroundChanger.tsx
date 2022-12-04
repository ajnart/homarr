import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';

interface BackgroundChangerProps {
  defaultValue: string | undefined;
}

export const BackgroundChanger = ({ defaultValue }: BackgroundChangerProps) => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(defaultValue);

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = ev.currentTarget.value;
    const backgroundImageUrl = value.trim().length === 0 ? undefined : value;
    setBackgroundImageUrl(backgroundImageUrl);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          backgroundImageUrl,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('background.label')}
      placeholder="/imgs/background.png"
      value={backgroundImageUrl}
      onChange={handleChange}
    />
  );
};
