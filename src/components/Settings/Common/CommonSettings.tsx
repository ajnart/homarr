import { Space, Stack, Text } from '@mantine/core';
import { useConfigContext } from '../../../config/provider';
import ConfigChanger from '../../Config/ConfigChanger';
import ConfigActions from './Config/ConfigActions';
import LanguageSelect from './Language/LanguageSelect';
import { SearchEngineSelector } from './SearchEngine/SearchEngineSelector';

export default function CommonSettings() {
  const { config } = useConfigContext();

  if (!config) {
    return (
      <Text color="red" align="center">
        No active config
      </Text>
    );
  }

  return (
    <Stack mb="md" mr="sm">
      <SearchEngineSelector searchEngine={config.settings.common.searchEngine} />
      <Space />
      <LanguageSelect />
      <ConfigChanger />
      <ConfigActions />
    </Stack>
  );
}
