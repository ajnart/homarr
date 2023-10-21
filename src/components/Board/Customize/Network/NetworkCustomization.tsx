import { Stack, Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import { useBoardCustomizationFormContext } from '../form';

export const NetworkCustomization = () => {
  const { t } = useTranslation('settings/common');
  const form = useBoardCustomizationFormContext();

  return (
    <Stack>
      <Switch
        label={t('layout.enableping')}
        {...form.getInputProps('network.pingsEnabled', { type: 'checkbox' })}
      />
    </Stack>
  );
};
