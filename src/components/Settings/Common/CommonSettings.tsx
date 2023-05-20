import { ScrollArea, Space, Stack, Text } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { useConfigContext } from '../../../config/provider';
import ConfigChanger from '../../Config/ConfigChanger';
import ConfigActions from './Config/ConfigActions';
import LanguageSelect from './Language/LanguageSelect';
import { SearchEngineSelector } from './SearchEngine/SearchEngineSelector';
import { CacheButtons } from './CacheButtons';

export default function CommonSettings() {
  const { config } = useConfigContext();
  const { height, width } = useViewportSize();

  if (!config) {
    return (
      <Text color="red" align="center">
        No active config
      </Text>
    );
  }
  return (
    <ScrollArea style={{ height: height - 100 }} scrollbarSize={5}>
      <Stack>
        <SearchEngineSelector searchEngine={config.settings.common.searchEngine} />
        <Space />
        <LanguageSelect />
        <ConfigChanger />
        <CacheButtons />
        <ConfigActions />
      </Stack>
    </ScrollArea>
  );
}
