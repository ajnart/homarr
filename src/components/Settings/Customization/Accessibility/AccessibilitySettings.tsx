import { Stack, Switch } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '~/pages/user/preferences';

export const AccessibilitySettings = () => {
  const { t } = useTranslation('user/preferences');

  const form = useFormContext();

  return (
    <Stack>
      <Switch
        label={t('disablePulse.label')}
        description={t('disablePulse.description')}
        {...form.getInputProps('disablePingPulse', { type: 'checkbox' })}
      />

      <Switch
        label={t('replaceIconsWithDots.label')}
        description={t('replaceIconsWithDots.description')}
        {...form.getInputProps('replaceDotsWithIcons', { type: 'checkbox' })}
      />
    </Stack>
  );
};
