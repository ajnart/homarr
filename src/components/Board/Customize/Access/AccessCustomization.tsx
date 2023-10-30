import { Stack, Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useBoardCustomizationFormContext } from '~/components/Board/Customize/form';

export const AccessCustomization = () => {
  const { t } = useTranslation('settings/customization/access');
  const form = useBoardCustomizationFormContext();
  return (
    <Stack>
      <Switch
        label={t('allowGuests.label')}
        description={t('allowGuests.description')}
        {...form.getInputProps('access.allowGuests', { type: 'checkbox' })}
      />
    </Stack>
  );
};
