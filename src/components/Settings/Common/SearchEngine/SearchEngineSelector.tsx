import { Alert, Paper, SegmentedControl, Space, Stack, TextInput, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ChangeEventHandler, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import {
  CommonSearchEngineCommonSettingsType,
  SearchEngineCommonSettingsType,
} from '../../../../types/settings';
import { SearchNewTabSwitch } from './SearchNewTabSwitch';

interface Props {
  searchEngine: SearchEngineCommonSettingsType;
}

export const SearchEngineSelector = ({ searchEngine }: Props) => {
  const { t } = useTranslation(['settings/general/search-engine']);
  const { updateSearchEngineConfig } = useUpdateSearchEngineConfig();

  const [engine, setEngine] = useState(searchEngine.type);
  const [searchUrl, setSearchUrl] = useState(
    searchEngine.type === 'custom' ? searchEngine.properties.template : searchUrls.google
  );

  const onEngineChange = (value: EngineType) => {
    setEngine(value);
    updateSearchEngineConfig(value, searchUrl);
  };

  const onSearchUrlChange: ChangeEventHandler<HTMLInputElement> = (ev) => {
    const url = ev.currentTarget.value;
    setSearchUrl(url);
    updateSearchEngineConfig(engine, url);
  };

  return (
    <Stack spacing={0} mt="xs">
      <Title order={5} mb="xs">
        {t('title')}
      </Title>

      <SegmentedControl
        fullWidth
        mb="sm"
        title={t('title')}
        value={engine}
        onChange={onEngineChange}
        data={searchEngineOptions}
      />
      <Paper p="md" py="sm" mb="md" withBorder>
        <Title order={6} mb={0}>
          Search engine configuration
        </Title>

        <SearchNewTabSwitch defaultValue={searchEngine.properties.openInNewTab} />

        {engine === 'custom' && (
          <>
            <Space mb="md" />
            <TextInput
              label={t('customEngine.label')}
              description={t('tips.placeholderTip')}
              placeholder={t('customEngine.placeholder')}
              value={searchUrl}
              onChange={onSearchUrlChange}
            />
          </>
        )}
      </Paper>
      <Alert icon={<IconInfoCircle />} color="blue">
        {t('tips.generalTip')}
      </Alert>
    </Stack>
  );
};

const searchEngineOptions: { label: string; value: EngineType }[] = [
  { label: 'Google', value: 'google' },
  { label: 'DuckDuckGo', value: 'duckDuckGo' },
  { label: 'Bing', value: 'bing' },
  { label: 'Custom', value: 'custom' },
];

export const searchUrls: { [key in CommonSearchEngineCommonSettingsType['type']]: string } = {
  google: 'https://google.com/search?q=',
  duckDuckGo: 'https://duckduckgo.com/?q=',
  bing: 'https://bing.com/search?q=',
};

type EngineType = SearchEngineCommonSettingsType['type'];

const useUpdateSearchEngineConfig = () => {
  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  if (!configName) {
    return {
      updateSearchEngineConfig: () => {},
    };
  }

  const updateSearchEngineConfig = (engine: EngineType, searchUrl: string) => {
    updateConfig(configName, (prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        common: {
          ...prev.settings.common,
          searchEngine:
            engine === 'custom'
              ? {
                  type: engine,
                  properties: {
                    ...prev.settings.common.searchEngine.properties,
                    template: searchUrl,
                  },
                }
              : {
                  type: engine,
                  properties: {
                    openInNewTab: prev.settings.common.searchEngine.properties.openInNewTab,
                    enabled: prev.settings.common.searchEngine.properties.enabled,
                  },
                },
        },
      },
    }));
  };

  return {
    updateSearchEngineConfig,
  };
};
