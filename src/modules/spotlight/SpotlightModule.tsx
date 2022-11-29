import {
  ActionIcon,
  Group,
  Kbd,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconSearch,
  IconBrandYoutube,
  IconDownload,
  IconMovie,
  IconBrandGoogle,
} from '@tabler/icons';
import { forwardRef, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { IModule } from '../ModuleTypes';

export const SpotlightModule: IModule = {
  title: 'Spotlight',
  icon: IconSearch,
  component: SpotlightModuleComponent,
  id: 'spotlight',
};

const searchEngines = [
  {
    label: 'Google',
    disabled: false,
    description: 'Search using your search engine (defined in settings)',
    icon: <IconSearch />,
    url: 'https://www.google.com/search?q=',
    shortcut: 'g',
  },
  {
    label: 'Youtube',
    disabled: false,
    description: 'Search Youtube',
    icon: <IconBrandYoutube />,
    url: 'https://www.youtube.com/results?search_query=',
    shortcut: 'y',
  },
  {
    label: 'Download',
    disabled: false,
    description: 'Search for torrents',
    icon: <IconDownload />,
    url: 'https://1337x.to/search/',
    shortcut: 't',
  },
  {
    label: 'Movies',
    disabled: true,
    description: 'Search for movies using Overseerr',
    icon: <IconMovie />,
    url: 'https://www.imdb.com/find?q=',
    shortcut: 'm',
  },
];

const data: ItemProps[] = [
  {
    icon: <IconBrandGoogle />,
    disabled: false,
    label: 'Google',
    value: 'google',
    description: 'Search using your search engine (defined in settings)',
    url: 'https://www.google.com/search?q=',
    shortcut: 'g',
  },

  {
    icon: <IconDownload />,
    disabled: false,
    label: 'Download',
    value: 'download',
    description: 'Search for torrents',
    url: 'https://1337x.to/search/',
    shortcut: 't',
  },
  {
    icon: <IconBrandYoutube />,
    disabled: false,
    label: 'Youtube',
    value: 'youtube',
    description: 'Search Youtube',
    url: 'https://www.youtube.com/results?search_query=',
    shortcut: 'y',
  },
  {
    icon: <IconMovie />,
    disabled: true,
    label: 'Movies',
    value: 'movies',
    description: 'Search for movies using Overseerr',
    url: 'https://www.imdb.com/find?q=',
    shortcut: 'm',
  },
];

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  disabled: boolean;
  value: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  shortcut: string;
}

export function SpotlightModuleComponent(props: any) {
  const [selectedSearchEngine, setSearchEngine] = useState<ItemProps>(data[0]);

  const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
    ({ icon, label, description, shortcut, ...others }: ItemProps, ref) => (
      <div ref={ref} {...others}>
        <Group position="apart" noWrap>
          <Group noWrap>
            {icon}
            <div>
              <Text size="sm">{label}</Text>
              <Text size="xs" opacity={0.65}>
                {description}
              </Text>
            </div>
          </Group>
          <Kbd>{shortcut}</Kbd>
        </Group>
      </div>
    )
  );

  const [opened, setOpened] = useState(false);
  useHotkeys([['mod+K', () => setOpened(!opened)]]);
  return (
    <Group grow>
      <Select
        icon={selectedSearchEngine.icon}
        onSearchChange={(search) =>
          setSearchEngine(
            data.find((item) => item.label.toLowerCase().includes(search.toLowerCase())) ||
              selectedSearchEngine
          )
        }
        withinPortal
        defaultValue={selectedSearchEngine.value}
        itemComponent={SelectItem}
        data={data}
        maxDropdownHeight={400}
      />
      <TextInput />
    </Group>
  );
}

function tryMatchSearch(
  query: string,
  selectedSearchEngine: ItemProps,
  setSearchEngine: React.Dispatch<React.SetStateAction<ItemProps>>,
  searchEngines: ItemProps[]
): void {
  // First check if the value of search contains any shortcut. Make sure it is not disabled
  const foundSearchEngine = searchEngines.find(
    (engine) => query.includes(`!${engine.shortcut}`) && !engine.disabled
  );
  if (foundSearchEngine) {
    // If a shortcut is found, use it. Except if it is disabled
    setSearchEngine(foundSearchEngine);
    showNotification({
      radius: 'lg',
      disallowClose: true,
      id: 'spotlight',
      autoClose: 1000,
      icon: <ActionIcon size="sm">{foundSearchEngine.icon}</ActionIcon>,
      message: `Using ${foundSearchEngine.label} as search engine`,
    });
  } else {
    // If no shortcut is found, do nothing (for now)
  }
}
