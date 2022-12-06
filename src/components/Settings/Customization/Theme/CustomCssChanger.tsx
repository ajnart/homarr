import { Textarea } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';

interface CustomCssChangerProps {
  defaultValue: string | undefined;
}

export const CustomCssChanger = ({ defaultValue }: CustomCssChangerProps) => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();
  const [customCss, setCustomCss] = useState(defaultValue);

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (ev) => {
    const { value } = ev.currentTarget;
    const customCss = value.trim().length === 0 ? undefined : value;
    setCustomCss(customCss);
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        customization: {
          ...prev.settings.customization,
          customCss,
        },
      },
    }));
  };

  return (
    <Textarea
      minRows={5}
      label={t('customCSS.label')}
      placeholder={t('customCSS.placeholder')}
      value={customCss}
      onChange={handleChange}
    />
  );
};
