import { Alert, Stack, Switch } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { BaseSyntheticEvent } from 'react';
import { useConfigStore } from '../../../../config/store';
import { useConfigContext } from '../../../../config/provider';
import { useTranslation } from 'react-i18next';

export const AccessibilitySettings = () => {
  const { t } = useTranslation('settings/customization/accessibility');
  const { updateConfig } = useConfigStore();
  const { config, name: configName } = useConfigContext();

  return (
    <Stack>
      <Switch
        label={t('disablePulse.label')}
        description={t('disablePulse.description')}
        defaultChecked={config?.settings.customization.accessibility?.disablePingPulse ?? false}
        onChange={(value: BaseSyntheticEvent) => {
          if (!configName) {
            return;
          }

          updateConfig(
            configName,
            (previousConfig) => ({
              ...previousConfig,
              settings: {
                ...previousConfig.settings,
                customization: {
                  ...previousConfig.settings.customization,
                  accessibility: {
                    ...previousConfig.settings.customization.accessibility,
                    disablePingPulse: value.target.checked,
                  },
                },
              },
            }),
            false,
            true
          );
        }}
      />

      <Switch
        label={t('replaceIconsWithDots.label')}
        description={t('replaceIconsWithDots.description')}
        defaultChecked={config?.settings.customization.accessibility?.disablePingPulse ?? false}
        onChange={(value: BaseSyntheticEvent) => {
          if (!configName) {
            return;
          }

          updateConfig(
            configName,
            (previousConfig) => ({
              ...previousConfig,
              settings: {
                ...previousConfig.settings,
                customization: {
                  ...previousConfig.settings.customization,
                  accessibility: {
                    ...previousConfig.settings.customization.accessibility,
                    replacePingDotsWithIcons: value.target.checked,
                  },
                },
              },
            }),
            false,
            true
          );
        }}
      />

      <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
        {t('alert')}
      </Alert>
    </Stack>
  );
};
