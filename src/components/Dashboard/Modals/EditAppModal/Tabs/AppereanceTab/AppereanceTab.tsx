import { Flex, NumberInput, Select, Stack, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef } from 'react';
import { IconSelector } from '~/components/IconSelector/IconSelector';
import { AppType } from '~/types/app';

interface AppearanceTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  disallowAppNamePropagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNamePropagation,
  allowAppNamePropagation,
}: AppearanceTabProps) => {
  const iconSelectorRef = useRef();
  const [debouncedValue] = useDebouncedValue(form.values.name, 2 * 1000); // 2 seconds debounce
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
    <Tabs.Panel value="appearance" pt="lg">
      <Stack spacing="xs">
        <Flex gap={5} mb="xs">
          <IconSelector
            defaultValue={form.values.appearance.iconUrl}
            onChange={(value) => {
              form.setFieldValue('appearance.iconUrl', value);
              disallowAppNamePropagation();
            }}
            value={form.values.appearance.iconUrl}
            ref={iconSelectorRef}
          />
        </Flex>
        <Select
          label={t('appearance.appNameStatus.label')}
          description={t('appearance.appNameStatus.description')}
          data={[
            { value: 'normal', label: t('appearance.appNameStatus.dropdown.normal') as string },
            { value: 'hover', label: t('appearance.appNameStatus.dropdown.hover') as string },
            { value: 'hidden', label: t('appearance.appNameStatus.dropdown.hidden') as string },
          ]}
          {...form.getInputProps('appearance.appNameStatus')}
          onChange={(value) => {
            form.setFieldValue('appearance.appNameStatus', value);
          }}
        />
        {form.values.appearance.appNameStatus === 'normal' && (
          <>
            <NumberInput
              label={t('appearance.appNameFontSize.label')}
              description={t('appearance.appNameFontSize.description')}
              min={5}
              max={64}
              {...form.getInputProps('appearance.appNameFontSize')}
              onChange={(value) => {
                form.setFieldValue('appearance.appNameFontSize', value);
              }}
            />
            <Select
              label={t('appearance.positionAppName.label')}
              description={t('appearance.positionAppName.description')}
              data={[
                {
                  value: 'column',
                  label: t('appearance.positionAppName.dropdown.top') as string,
                },
                {
                  value: 'row-reverse',
                  label: t('appearance.positionAppName.dropdown.right') as string,
                },
                {
                  value: 'column-reverse',
                  label: t('appearance.positionAppName.dropdown.bottom') as string,
                },
                {
                  value: 'row',
                  label: t('appearance.positionAppName.dropdown.left') as string,
                },
              ]}
              {...form.getInputProps('appearance.positionAppName')}
              onChange={(value) => {
                form.setFieldValue('appearance.positionAppName', value);
              }}
            />
            <NumberInput
              label={t('appearance.lineClampAppName.label')}
              description={t('appearance.lineClampAppName.description')}
              min={0}
              {...form.getInputProps('appearance.lineClampAppName')}
              onChange={(value) => {
                form.setFieldValue('appearance.lineClampAppName', value);
              }}
            />
          </>
        )}
      </Stack>
    </Tabs.Panel>
  );
};

const replaceCharacters = (value: string) => value.toLowerCase().replaceAll('', '-');
