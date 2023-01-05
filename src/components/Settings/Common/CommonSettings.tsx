import { ScrollArea, Space, Stack, Text } from '@mantine/core';
import { useElementSize, useViewportSize } from '@mantine/hooks';
import { useConfigContext } from '../../../config/provider';
import ConfigChanger from '../../Config/ConfigChanger';
import ConfigActions from './Config/ConfigActions';
import LanguageSelect from './Language/LanguageSelect';
import { SearchEngineSelector } from './SearchEngine/SearchEngineSelector';

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
    <ScrollArea style={{ height: height - 100 }} offsetScrollbars>
      <Stack>
        <SearchEngineSelector searchEngine={config.settings.common.searchEngine} />
        <Space />
        <LanguageSelect />
        <ConfigChanger />
        <ConfigActions />
      </Stack>
    </ScrollArea>
  );
}
