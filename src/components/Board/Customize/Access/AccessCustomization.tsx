import { Stack, Switch } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useBoardCustomizationFormContext } from '~/components/Board/Customize/form';

export const AccessCustomization = () => {
  const { t } = useTranslation('settings/customization/access');
  const form = useBoardCustomizationFormContext();

  console.log(form.values.access.allowAnonymous);
  return (
    <Stack>
      <Switch label={t('allowAnonymous.label')} description={t('allowAnonymous.description')} {...form.getInputProps('access.allowAnonymous', { type: 'checkbox' })} />
    </Stack>
  )
}