import { Paper, SegmentedControl, Stack, Switch, TextInput } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';
import { useUserPreferencesFormContext } from '~/pages/user/preferences';

export const SearchEngineSettings = () => {
  const { t } = useTranslation('user/preferences');
  const form = useUserPreferencesFormContext();
  const segmentData = useSegmentData();
  const segmentValue = useMemo(
    () =>
      searchEngineOptions.find((x) => x.value === form.values.searchTemplate)?.value ?? 'custom',
    [form.values.searchTemplate]
  );

  return (
    <Stack>
      <SegmentedControl
        fullWidth
        data={segmentData}
        value={segmentValue}
        onChange={(v: typeof segmentValue) => {
          v === 'custom'
            ? form.setFieldValue('searchTemplate', '')
            : form.setFieldValue('searchTemplate', v);
        }}
      />
      <Paper p="md" py="sm" mb="md" withBorder>
        <Stack spacing="sm">
          <Switch
            label={t('searchEngine.newTab.label')}
            {...form.getInputProps('openSearchInNewTab', { type: 'checkbox' })}
          />
          <Switch
            label={t('searchEngine.autoFocus.label')}
            description={t('searchEngine.autoFocus.description')}
            {...form.getInputProps('autoFocusSearch', { type: 'checkbox' })}
          />

          <TextInput
            label={t('searchEngine.template.label')}
            description={t('searchEngine.template.description')}
            inputWrapperOrder={['label', 'input', 'description', 'error']}
            withAsterisk
            {...form.getInputProps('searchTemplate')}
          />
        </Stack>
      </Paper>
    </Stack>
  );
};

const searchEngineOptions = [
  { label: 'Google', value: 'https://google.com/search?q=%s' },
  { label: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=%s' },
  { label: 'Bing', value: 'https://bing.com/search?q=%s' },
  { value: 'custom' },
] as const;

const useSegmentData = () => {
  const { t } = useTranslation('user/preferences');
  return searchEngineOptions.map((option) => ({
    label: option.value === 'custom' ? t('searchEngine.custom') : option.label,
    value: option.value,
  }));
};
