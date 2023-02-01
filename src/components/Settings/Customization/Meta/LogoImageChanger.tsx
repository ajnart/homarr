import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export const LogoImageChanger = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { config, name: configName } = useConfigContext();
  const [logoImageSrc, setLogoImageSrc] = useState(config?.settings.customization.logoImageUrl ?? '/imgs/logo/logo.png');

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value } = ev.currentTarget;
    const logoImageSrc = value.trim();
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
      description="The dashboard logo at the top left"
      placeholder="/imgs/logo/logo.png"
      value={logoImageSrc}
      onChange={handleChange}
      mb="sm"
    />
  );
};
