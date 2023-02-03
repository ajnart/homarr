import { Alert, Button, Grid, Input, LoadingOverlay, Slider, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconReload } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { GridstackBreakpoints } from '../../../../constants/gridstack-breakpoints';
import { sleep } from '../../../../tools/client/time';
import { GridstackSettingsType } from '../../../../types/settings';

export const GridstackConfiguration = () => {
  const { t } = useTranslation();
  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  if (!config || !configName) {
    return null;
  }

  const initialValue = config.settings.customization?.gridstack ?? {
    columnCountSmall: 3,
    columnCountMedium: 6,
    columnCountLarge: 12,
  };

  const form = useForm({
    initialValues: initialValue,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: GridstackSettingsType) => {
    setIsSaving(true);

    await sleep(250);
    await updateConfig(
      configName,
      (previousConfig) => ({
        ...previousConfig,
        settings: {
          ...previousConfig.settings,
          customization: {
            ...previousConfig.settings.customization,
            gridstack: values,
          },
        },
      }),
      true,
      true
    );

    form.resetDirty();
    setIsSaving(false);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} style={{ position: 'relative' }}>
      <LoadingOverlay overlayBlur={2} visible={isSaving} radius="md" />
      <Title order={6}>Gridstack configuration</Title>
      <Input.Wrapper
        label="Small"
        description={`Number of columns when the screen is less than ${GridstackBreakpoints.Medium} pixels wide`}
        mb="md"
      >
        <Slider min={1} max={8} mt="xs" {...form.getInputProps('columnCountSmall')} />
      </Input.Wrapper>
      <Input.Wrapper
        label="Medium"
        description={`Number of columns when the screen is less than ${GridstackBreakpoints.Large} pixels wide`}
        mb="md"
      >
        <Slider min={3} max={16} mt="xs" {...form.getInputProps('columnCountMedium')} />
      </Input.Wrapper>
      <Input.Wrapper
        label="Large"
        description={`Number of columns when the screen is more than ${GridstackBreakpoints.Large} pixels wide`}
      >
        <Slider min={5} max={20} mt="xs" {...form.getInputProps('columnCountLarge')} />
      </Input.Wrapper>
      {form.isDirty() && (
        <Alert variant="light" color="yellow" title="Unsaved changes" my="md">
          You have unsaved changes. Click the Apply changes button below to apply and save.
        </Alert>
      )}
      <Grid mt="md">
        <Grid.Col md={6} xs={12}>
          <Button variant="light" leftIcon={<IconCheck size={18} />} type="submit" fullWidth>
            Apply changes
          </Button>
        </Grid.Col>
        <Grid.Col md={6} xs={12}>
          <Button
            variant="light"
            leftIcon={<IconReload size={18} />}
            onClick={() =>
              form.setValues({
                columnCountSmall: 3,
                columnCountMedium: 6,
                columnCountLarge: 12,
              })
            }
            fullWidth
          >
            Default values
          </Button>
        </Grid.Col>
      </Grid>
    </form>
  );
};
