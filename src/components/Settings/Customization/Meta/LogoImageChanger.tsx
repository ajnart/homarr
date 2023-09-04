import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';

import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

export const LogoImageChanger = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { config, name: configName } = useConfigContext();
  const [logoImageUrl, setLogoImageUrl] = useState(
    config?.settings.customization.logoImageUrl ?? '/imgs/logo/logo.png'
  );

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const { value: logoImageUrl } = ev.currentTarget;
    setLogoImageUrl(logoImageUrl);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          logoImageUrl,
        },
      },
    }));
  };

  return (
    <TextInput
      label={t('logo.label')}
      description={t('logo.description')}
      placeholder="/imgs/logo/logo.png"
      value={logoImageUrl}
      onChange={handleChange}
      mb="sm"
    />
  );
};
