import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';

interface LogoImageChangerProps {
  defaultValue: string | undefined;
}

export const LogoImageChanger = ({ defaultValue }: LogoImageChangerProps) => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();
  const [logoImageSrc, setLogoImageSrc] = useState(defaultValue);

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = ev.currentTarget.value;
    const logoImageSrc = value.trim().length === 0 ? undefined : value;
    setLogoImageSrc(logoImageSrc);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          logoImageUrl: logoImageSrc,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('logo.label')}
      placeholder="/imgs/logo/logo.png"
      value={logoImageSrc}
      onChange={handleChange}
    />
  );
};
