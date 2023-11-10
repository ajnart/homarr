import { Grid, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import { useBoardCustomizationFormContext } from '../form';

export const PageMetadataCustomization = () => {
  const { t } = useTranslation('settings/customization/page-appearance');
  const form = useBoardCustomizationFormContext();
  return (
    <Grid gutter="md" align="stretch">
      <Grid.Col span={12} sm={6}>
        <TextInput
          label={t('pageTitle.label')}
          description={t('pageTitle.description')}
          placeholder="homarr"
          {...form.getInputProps('pageMetadata.pageTitle')}
        />
      </Grid.Col>
      <Grid.Col span={12} sm={6}>
        <TextInput
          label={t('metaTitle.label')}
          description={t('metaTitle.description')}
          placeholder="homarr - the best dashboard"
          {...form.getInputProps('pageMetadata.metaTitle')}
        />
      </Grid.Col>
      <Grid.Col span={12} sm={6}>
        <TextInput
          label={t('logo.label')}
          description={t('logo.description')}
          placeholder="/imgs/logo/logo.png"
          {...form.getInputProps('pageMetadata.logoSrc')}
        />
      </Grid.Col>
      <Grid.Col span={12} sm={6}>
        <TextInput
          label={t('favicon.label')}
          description={t('favicon.description')}
          placeholder="/imgs/favicon/favicon.svg"
          {...form.getInputProps('pageMetadata.faviconSrc')}
        />
      </Grid.Col>
    </Grid>
  );
};
