import { TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';

interface PageTitleChangerProps {
  defaultValue: string | undefined;
}

// TODO: change to dashboard title
export const PageTitleChanger = ({ defaultValue }: PageTitleChangerProps) => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();
  const [pageTitle, setPageTitle] = useState(defaultValue);

  if (!configName) return null;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = ev.currentTarget.value;
    const pageTitle = value.trim().length === 0 ? undefined : value;
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
      placeholder={t('pageTitle.placeholder')}
      value={pageTitle}
      onChange={handleChange}
    />
  );
};
