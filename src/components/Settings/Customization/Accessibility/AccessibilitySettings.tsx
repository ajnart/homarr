import { Alert, Stack, Switch } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { BaseSyntheticEvent } from 'react';
import { useConfigStore } from '../../../../config/store';
import { useConfigContext } from '../../../../config/provider';

export const AccessibilitySettings = () => {
  const { updateConfig } = useConfigStore();
  const { config, name: configName } = useConfigContext();

  return (
    <Stack>
      <Switch
        label="Disable ping pulse"
        description="By default, ping indicators in Homarr will pulse. This may be irritating. This slider will deactivate the animation"
        defaultChecked={config?.settings.customization.accessibility.disablePingPulse ?? false}
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
        label="Replace ping dots with icons"
        description="For colorblind users, ping dots may be unrecognizable. This will replace indicators with icons"
        defaultChecked={config?.settings.customization.accessibility.disablePingPulse ?? false}
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
        Are you missing something? We&apos;ll gladly extend the accessibility of Homarr.
      </Alert>
    </Stack>
  );
};
