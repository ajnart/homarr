import { Stack, Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useUserPreferencesFormContext } from '~/pages/user/preferences';

export const AccessibilitySettings = () => {
  const { t } = useTranslation('user/preferences');

  const form = useUserPreferencesFormContext();

  return (
    <Stack>
      <Switch
        label={t('accessibility.disablePulse.label')}
        description={t('accessibility.disablePulse.description')}
        {...form.getInputProps('disablePingPulse', { type: 'checkbox' })}
      />

      <Switch
        label={t('accessibility.replaceIconsWithDots.label')}
        description={t('accessibility.replaceIconsWithDots.description')}
        {...form.getInputProps('replaceDotsWithIcons', { type: 'checkbox' })}
      />
    </Stack>
  );
};
