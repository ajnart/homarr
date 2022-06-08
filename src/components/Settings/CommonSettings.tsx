import { ActionIcon, Group, Text, SegmentedControl, TextInput, Anchor } from '@mantine/core';
import { useState } from 'react';
import { IconBrandGithub as BrandGithub } from '@tabler/icons';
import { CURRENT_VERSION } from '../../../data/constants';
import { useConfig } from '../../tools/state';
import { ColorSchemeSwitch } from '../ColorSchemeToggle/ColorSchemeSwitch';
import ConfigChanger from '../Config/ConfigChanger';
import SaveConfigComponent from '../Config/SaveConfig';
import ModuleEnabler from './ModuleEnabler';
import { ColorSelector } from './ColorSelector';
import { ShadeSelector } from './ShadeSelector';

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
    <Group direction="column" grow>
      <Group grow direction="column" spacing={0}>
        <Text>Search engine</Text>
        <SegmentedControl
          fullWidth
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
          <TextInput
            label="Query URL"
            placeholder="Custom query url"
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
        )}
      </Group>
      <ModuleEnabler />
      <ColorSchemeSwitch />
      <ColorSelector type="primary" />
      <ColorSelector type="secondary" />
      <ShadeSelector />
      <ConfigChanger />
      <SaveConfigComponent />
      <Text
        style={{
          alignSelf: 'center',
          fontSize: '0.75rem',
          textAlign: 'center',
          color: 'gray',
        }}
      >
        Tip: You can upload your config file by dragging and dropping it onto the page!
      </Text>
      <Group position="center" direction="row" mr="xs">
        <Group spacing={0}>
          <ActionIcon<'a'> component="a" href="https://github.com/ajnart/homarr" size="lg">
            <BrandGithub size={18} />
          </ActionIcon>
          <Text
            style={{
              position: 'relative',
              fontSize: '0.90rem',
              color: 'gray',
            }}
          >
            {CURRENT_VERSION}
          </Text>
        </Group>
        <Text
          style={{
            fontSize: '0.90rem',
            textAlign: 'center',
            color: 'gray',
          }}
        >
          Made with ❤️ by @
          <Anchor
            href="https://github.com/ajnart"
            style={{ color: 'inherit', fontStyle: 'inherit', fontSize: 'inherit' }}
          >
            ajnart
          </Anchor>
        </Text>
      </Group>
    </Group>
  );
}
