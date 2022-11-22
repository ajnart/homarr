import { Button, Group } from '@mantine/core';
import { IconSearch, IconBrandYoutube, IconDownload, IconMovie } from '@tabler/icons';
import { SpotlightProvider, openSpotlight } from '@mantine/spotlight';
import type { SpotlightAction } from '@mantine/spotlight';
import { useState } from 'react';
import { IModule } from '../ModuleTypes';

export const SpotlightModule: IModule = {
  title: 'Spotlight',
  icon: IconSearch,
  component: SpotlightModuleComponent,
  id: 'spotlight',
};

interface SearchEngine {
  name: string;
  enabled: boolean;
  description: string;
  icon: React.ReactNode;
  url: string;
  shortcut: string;
}
const searchEngines: SearchEngine[] = [
  {
    name: 'Google',
    enabled: true,
    description: 'Search using your search engine (defined in settings)',
    icon: <IconSearch />,
    url: 'https://www.google.com/search?q=',
    shortcut: 'g',
  },
  {
    name: 'Youtube',
    enabled: true,
    description: 'Search Youtube',
    icon: <IconBrandYoutube />,
    url: 'https://www.youtube.com/results?search_query=',
    shortcut: 'y',
  },
  {
    name: 'Download',
    enabled: true,
    description: 'Search for torrents',
    icon: <IconDownload />,
    url: 'https://1337x.to/search/',
    shortcut: 't',
  },
  {
    name: 'Movies',
    icon: <IconMovie />,
    enabled: false,
    description: 'Search for movies using Overseerr',
    url: 'https://www.imdb.com/find?q=',
    shortcut: 'm',
  },
];

function SpotlightControl() {
  return (
    <Group position="center">
      <Button onClick={() => openSpotlight()}>Open spotlight</Button>
    </Group>
  );
}

export function SpotlightModuleComponent(props: any) {
  const [selectedSearchEngine, setSearchEngine] = useState<SearchEngine>(searchEngines[0]);
  const actions: SpotlightAction[] = searchEngines.map((engine) => ({
    title: engine.name,
    description: engine.description,
    icon: engine.icon,
    onTrigger: () => {
      setSearchEngine(engine);
    },
    closeOnTrigger: false,
  }));
  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={selectedSearchEngine.icon}
      searchPlaceholder={selectedSearchEngine.description}
      shortcut="mod + k"
      nothingFoundMessage="Press enter to search..."
      onQueryChange={(researchString) =>
        useSearchBrowser(researchString, selectedSearchEngine, setSearchEngine, searchEngines)
      }
    >
      <SpotlightControl />
    </SpotlightProvider>
  );
}
function useSearchBrowser(
  search: string,
  selectedSearchEngine: SearchEngine,
  setSearchEngine: React.Dispatch<React.SetStateAction<SearchEngine>>,
  searchEngines: SearchEngine[]
): void {
  // First check if the value of search contains any shortcut
  const foundSearchEngine = searchEngines.find((engine) => search.includes(`!${engine.shortcut}`));
  if (foundSearchEngine) {
    // If a shortcut is found, use it
    setSearchEngine(foundSearchEngine);
    search.replace(`!${foundSearchEngine.shortcut}`, '');
  } else {
    // If no shortcut is found, do nothing (for now)
  }
}
