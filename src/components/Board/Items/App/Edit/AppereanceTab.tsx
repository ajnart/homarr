import { Flex, NumberInput, Select, Stack, Tabs } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef } from 'react';
import { IconSelector } from '~/components/IconSelector/IconSelector';
import { appNamePositions, appNameStyles } from '~/server/db/items';

import { type AppForm } from '../EditAppModal';

interface AppearanceTabProps {
  form: AppForm;
  disallowAppNamePropagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNamePropagation,
  allowAppNamePropagation,
}: AppearanceTabProps) => {
  const iconSelectorRef = useRef();
  const [debouncedValue] = useDebouncedValue(form.values.name, 500);
  const { t } = useTranslation('layout/modals/add-app');

  useEffect(() => {
    if (allowAppNamePropagation !== true) {
      return;
    }

    if (!iconSelectorRef.current) {
      return;
    }

    const currentRef = iconSelectorRef.current as {
      chooseFirstOrDefault: (debouncedValue: string) => void;
    };

    currentRef.chooseFirstOrDefault(debouncedValue);
  }, [debouncedValue]);

  return (
    <Tabs.Panel value="appearance" pt="sm">
      <Stack spacing="xs">
        <Flex gap={5} mb="xs">
          <IconSelector
            defaultValue={form.values.iconUrl}
            onChange={(value) => {
              form.setFieldValue('iconUrl', value!);
              disallowAppNamePropagation();
            }}
            value={form.values.iconUrl}
            ref={iconSelectorRef}
          />
        </Flex>
        <Select
          label={t('appearance.appNameStatus.label')}
          description={t('appearance.appNameStatus.description')}
          data={appNameStyles.map((value) => ({
            value,
            label: t(`appearance.appNameStatus.dropdown.${value}`)!,
          }))}
          {...form.getInputProps('nameStyle')}
        />
        {form.values.nameStyle === 'normal' && (
          <>
            <NumberInput
              label={t('appearance.appNameFontSize.label')}
              description={t('appearance.appNameFontSize.description')}
              min={5}
              max={64}
              {...form.getInputProps('fontSize')}
            />
            <Select
              label={t('appearance.positionAppName.label')}
              description={t('appearance.positionAppName.description')}
              data={appNamePositions.map((value) => ({
                value,
                label: t(`appearance.positionAppName.dropdown.${value}`)!,
              }))}
              {...form.getInputProps('namePosition')}
            />
            <NumberInput
              label={t('appearance.lineClampAppName.label')}
              description={t('appearance.lineClampAppName.description')}
              min={0}
              {...form.getInputProps('nameLineClamp')}
            />
          </>
        )}
      </Stack>
    </Tabs.Panel>
  );
};
