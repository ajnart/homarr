import { Group, Text, SegmentedControl, TextInput, Stack } from '@mantine/core';
import { useState } from 'react';
import { useConfig } from '../../tools/state';
import { ColorSchemeSwitch } from '../ColorSchemeToggle/ColorSchemeSwitch';
import { WidgetsPositionSwitch } from '../WidgetsPositionSwitch/WidgetsPositionSwitch';
import ConfigChanger from '../Config/ConfigChanger';
import SaveConfigComponent from '../Config/SaveConfig';
import ModuleEnabler from './ModuleEnabler';
import Tip from '../layout/Tip';

export default function CommonSettings(args: any) {
  const { config, setConfig } = useConfig();

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
    <Stack mb="lg">
      <Stack spacing={0}>
        <Text>Search engine</Text>
        <Tip>
          Use the prefixes <b>!yt</b> and <b>!t</b> in front of your query to search on YouTube or
          for a Torrent respectively.
        </Tip>
        <SegmentedControl
          fullWidth
          mb="sm"
          title="Search engine"
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
            <Tip>%s can be used as a placeholder for the query.</Tip>
            <TextInput
              label="Query URL"
              placeholder="Custom query URL"
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
      <ColorSchemeSwitch />
      <WidgetsPositionSwitch />
      <ModuleEnabler />
      <ConfigChanger />
      <SaveConfigComponent />
      <Tip>Upload your config file by dragging and dropping it onto the page!</Tip>
    </Stack>
  );
}
