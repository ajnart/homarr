import { Alert, Stack, Switch } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '~/pages/user/preferences';

export const AccessibilitySettings = () => {
  const { t } = useTranslation('settings/customization/accessibility');

  const form = useFormContext();

  return (
    <Stack>
      <Switch
        label={t('disablePulse.label')}
        description={t('disablePulse.description')}
        {...form.getInputProps('disablePingPulse')}
      />

      <Switch
        label={t('replaceIconsWithDots.label')}
        description={t('replaceIconsWithDots.description')}
        {...form.getInputProps('replaceDotsWithIcons')}
      />

      <Alert icon={<IconInfoCircle size="1rem" />} color="blue">
        {t('alert')}
      </Alert>
    </Stack>
  );
};
