import { Flex, Select, Stack, Switch, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';

import { AppType } from '../../../../../../types/app';
import { IconSelector } from '../../../../../IconSelector/IconSelector';

interface AppearanceTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  disallowAppNameProgagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNameProgagation,
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
    <Tabs.Panel value="appearance" pt="lg">
      <Stack spacing="xs">
        <Flex gap={5} mb="xs">
          <IconSelector
            defaultValue={form.values.appearance.iconUrl}
            onChange={(value) => {
              form.setFieldValue('appearance.iconUrl', value);
              disallowAppNameProgagation();
            }}
            value={form.values.appearance.iconUrl}
            ref={iconSelectorRef}
          />
        </Flex>
        <Switch
          label={t('appearance.hideAppName.label')}
          description={t('appearance.hideAppName.description')}
          styles={{ label: { fontWeight: 500, }, description: { marginTop: 0, }, }}
          {...form.getInputProps('appearance.hideAppName', { type: 'checkbox' })}
        />
        {!form.values.appearance.hideAppName && (
          <Select
            label={t('appearance.positionAppName.label')}
            description={t('appearance.positionAppName.description')}
            data={[
              { value: 'row', label: 'Left' },
              { value: 'column', label: 'Top' },
              { value: 'row-reverse', label: 'Right' },
              { value: 'column-reverse', label: 'Bottom' },
            ]}
            {...form.getInputProps('appearance.positionAppName')}
            onChange={(value) => {
              form.setFieldValue('appearance.positionAppName', value)
            }}
          />
        )}
      </Stack>
    </Tabs.Panel>
  );
};

const replaceCharacters = (value: string) => value.toLowerCase().replaceAll('', '-');
