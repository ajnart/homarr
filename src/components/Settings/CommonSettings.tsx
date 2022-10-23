import { Text, SegmentedControl, TextInput, Stack } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { SearchNewTabSwitch } from '../SearchNewTabSwitch/SearchNewTabSwitch';
import { ColorSchemeSwitch } from '../ColorSchemeToggle/ColorSchemeSwitch';
import { WidgetsPositionSwitch } from '../WidgetsPositionSwitch/WidgetsPositionSwitch';
import ConfigChanger from '../Config/ConfigChanger';
import SaveConfigComponent from '../Config/SaveConfig';
import ModuleEnabler from './ModuleEnabler';
import Tip from '../layout/Tip';
import LanguageSwitch from './LanguageSwitch';

export default function CommonSettings(args: any) {
  const { config, setConfig } = useConfig();
  const { t } = useTranslation(['settings/general/search-engine', 'settings/common']);

  const matches = [
    { label: 'Google', value: 'https://google.com/search?q=' },
    { label: 'DuckDuckGo', value: 'https://duckduckgo.com/?q=' },
    { label: 'Bing', value: 'https://bing.com/search?q=' },
    { label: 'Custom', value: 'Custom' },
  ];

  const [customSearchUrl, setCustomSearchUrl] = useState(config.settings.searchUrl);
  const [searchUrl, setSearchUrl] = useState(
    matches.find((match) => match.value === config.settings.searchUrl)?.value ?? 'Custom'
  );

  return (
    <Stack mb="md" mr="sm">
      <Stack spacing={0} mt="xs">
        <Text>{t('title')}</Text>
        <Tip>{t('tips.generalTip')}</Tip>
        <SegmentedControl
          fullWidth
          mb="sm"
          title={t('title')}
          value={
            // Match config.settings.searchUrl with a key in the matches array
            searchUrl
          }
          onChange={
            // Set config.settings.searchUrl to the value of the selected item
            (e) => {
              setSearchUrl(e);
              setConfig({
                ...config,
                settings: {
                  ...config.settings,
                  searchUrl: e,
                },
              });
            }
          }
          data={matches}
        />
        {searchUrl === 'Custom' && (
          <>
            <Tip>{t('tips.placeholderTip')}</Tip>
            <TextInput
              label={t('customEngine.label')}
              placeholder={t('customEngine.placeholder')}
              value={customSearchUrl}
              onChange={(event) => {
                setCustomSearchUrl(event.currentTarget.value);
                setConfig({
                  ...config,
                  settings: {
                    ...config.settings,
                    searchUrl: event.currentTarget.value,
                  },
                });
              }}
            />
          </>
        )}
      </Stack>
      <SearchNewTabSwitch />
      <ColorSchemeSwitch />
      <WidgetsPositionSwitch />
      <ModuleEnabler />
      <LanguageSwitch />
      <ConfigChanger />
      <SaveConfigComponent />
      <Tip>{t('settings/common:tips.configTip')}</Tip>
    </Stack>
  );
}
