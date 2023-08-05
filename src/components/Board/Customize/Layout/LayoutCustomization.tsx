import { Checkbox, Grid, Stack } from '@mantine/core';
import { useTranslation } from 'next-i18next';

import { useBoardCustomizationFormContext } from '../form';
import { LayoutPreview } from './LayoutPreview';

export const LayoutCustomization = () => {
  const { t } = useTranslation('settings/common');
  const form = useBoardCustomizationFormContext();

  return (
    <Grid gutter="xl" align="stretch">
      <Grid.Col span={12} sm={6}>
        <LayoutPreview
          showLeftSidebar={form.values.layout.leftSidebarEnabled}
          showRightSidebar={form.values.layout.rightSidebarEnabled}
          showPings={form.values.layout.pingsEnabled}
        />
      </Grid.Col>
      <Grid.Col span={12} sm={6}>
        <Stack spacing="sm" h="100%" justify="space-between">
          <Stack spacing="xs">
            <Checkbox
              label={t('layout.enablelsidebar')}
              description={t('layout.enablelsidebardesc')}
              {...form.getInputProps('layout.leftSidebarEnabled', { type: 'checkbox' })}
            />
            <Checkbox
              label={t('layout.enablersidebar')}
              description={t('layout.enablersidebardesc')}
              {...form.getInputProps('layout.rightSidebarEnabled', { type: 'checkbox' })}
            />
            <Checkbox
              label={t('layout.enableping')}
              {...form.getInputProps('layout.pingsEnabled', { type: 'checkbox' })}
            />
          </Stack>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};
