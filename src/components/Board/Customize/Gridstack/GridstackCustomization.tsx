import { Input, Slider } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { GridstackBreakpoints } from '~/constants/gridstack-breakpoints';

import { useBoardCustomizationFormContext } from '../form';

export const GridstackCustomization = () => {
  const { t } = useTranslation('settings/customization/gridstack');
  const form = useBoardCustomizationFormContext();

  return (
    <>
      <Input.Wrapper
        label={t('columnsCount.labelPreset', { size: t('common:breakPoints.small') })}
        description={t('columnsCount.descriptionPreset', { pixels: GridstackBreakpoints.medium })}
        mb="md"
      >
        <Slider min={1} max={8} mt="xs" {...form.getInputProps('gridstack.sm')} />
      </Input.Wrapper>
      <Input.Wrapper
        label={t('columnsCount.labelPreset', { size: t('common:breakPoints.medium') })}
        description={t('columnsCount.descriptionPreset', { pixels: GridstackBreakpoints.large })}
        mb="md"
      >
        <Slider min={3} max={16} mt="xs" {...form.getInputProps('gridstack.md')} />
      </Input.Wrapper>
      <Input.Wrapper
        label={t('columnsCount.labelPreset', { size: t('common:breakPoints.large') })}
        description={t('columnsCount.descriptionExceedsPreset', {
          pixels: GridstackBreakpoints.large,
        })}
      >
        <Slider min={5} max={20} mt="xs" {...form.getInputProps('gridstack.lg')} />
      </Input.Wrapper>
    </>
  );
};
