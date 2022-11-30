import {
  ActionIcon,
  Autocomplete,
  Box,
  createStyles,
  Divider,
  Kbd,
  Menu,
  Popover,
  ScrollArea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconSearch, IconBrandYoutube, IconDownload, IconMovie } from '@tabler/icons';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useDebouncedValue, useHotkeys } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import { IModule } from '../ModuleTypes';
import { useConfig } from '../../tools/state';
import { OverseerrModule } from '../overseerr';
import Tip from '../../components/layout/Tip';
import { OverseerrMediaDisplay } from '../common';
import SmallServiceItem from '../../components/AppShelf/SmallServiceItem';

export const SearchModule: IModule = {
  title: 'Search',
  icon: IconSearch,
  component: SearchModuleComponent,
  id: 'search',
};

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  label: string;
  disabled: boolean;
  value: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  shortcut: string;
}

const useStyles = createStyles((theme) => ({
  item: {
    '&[data-hovered]': {
      backgroundColor: theme.colors[theme.primaryColor][theme.fn.primaryShade()],
      color: theme.white,
    },
  },
}));

export function SearchModuleComponent() {
  const { config } = useConfig();
  const { t } = useTranslation('modules/search');
  const [searchQuery, setSearchQuery] = useState('');
  const [debounced, cancel] = useDebouncedValue(searchQuery, 250);
  const isOverseerrEnabled = config.modules?.[OverseerrModule.id]?.enabled ?? false;
  const OverseerrService = config.services.find(
    (service) => service.type === 'Overseerr' || service.type === 'Jellyseerr'
  );

  const searchEnginesList: ItemProps[] = [
    {
      icon: <IconSearch />,
      disabled: false,
      label: t('searchEngines.search.name'),
      value: 'search',
      description: t('searchEngines.search.description'),
      url: config.settings.searchUrl,
      shortcut: 's',
    },
    {
      icon: <IconDownload />,
      disabled: false,
      label: t('searchEngines.torrents.name'),
      value: 'torrents',
      description: t('searchEngines.torrents.description'),
      url: 'https://www.torrentdownloads.me/search/?search=',
      shortcut: 't',
    },
    {
      icon: <IconBrandYoutube />,
      disabled: false,
      label: t('searchEngines.youtube.name'),
      value: 'youtube',
      description: t('searchEngines.youtube.description'),
      url: 'https://www.youtube.com/results?search_query=',
      shortcut: 'y',
    },
    {
      icon: <IconMovie />,
      disabled: !(isOverseerrEnabled === true && OverseerrService !== undefined),
      label: t('searchEngines.overseerr.name'),
      value: 'overseerr',
      description: t('searchEngines.overseerr.description'),
      url: `${OverseerrService?.url}search?query=`,
      shortcut: 'm',
    },
  ];
  const [selectedSearchEngine, setSearchEngine] = useState<ItemProps>(searchEnginesList[0]);
  const matchingServices = config.services.filter((service) => {
    if (searchQuery === '' || searchQuery === undefined) {
      return false;
    }
    return service.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const autocompleteData = matchingServices.map((service) => ({
    label: service.name,
    value: service.name,
    icon: service.icon,
    url: service.openedUrl ?? service.url,
  }));
  const AutoCompleteItem = forwardRef<HTMLDivElement, any>(
    ({ label, value, icon, url, ...others }: any, ref) => (
      <div ref={ref} {...others}>
        <SmallServiceItem service={{ label, value, icon, url }} />
      </div>
    )
  );
  useEffect(() => {
    // Refresh the default search engine every time the config for it changes #521
    setSearchEngine(searchEnginesList[0]);
  }, [config.settings.searchUrl]);
  const textInput = useRef<HTMLInputElement>(null);
  useHotkeys([['mod+K', () => textInput.current && textInput.current.focus()]]);
  const { classes } = useStyles();
  const openInNewTab = config.settings.searchNewTab ? '_blank' : '_self';
  const [OverseerrResults, setOverseerrResults] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (debounced !== '' && selectedSearchEngine.value === 'overseerr' && searchQuery.length > 3) {
      axios.get(`/api/modules/overseerr?query=${searchQuery}`).then((res) => {
        setOverseerrResults(res.data.results ?? []);
      });
    }
  }, [debounced]);

  const isModuleEnabled = config.modules?.[SearchModule.id]?.enabled ?? false;
  if (!isModuleEnabled) {
    return null;
  }
  //TODO: Fix the bug where clicking anything inside the Modal to ask for a movie
  // will close it (Because it closes the underlying Popover)
  return (
    <Box style={{ width: '100%', maxWidth: 400 }}>
      <Popover
        opened={OverseerrResults.length > 0 && opened && searchQuery.length > 3}
        position="bottom"
        withinPortal
        shadow="md"
        radius="md"
        zIndex={100}
        transition="pop-top-right"
      >
        <Popover.Target>
          <Autocomplete
            ref={textInput}
            onFocusCapture={() => setOpened(true)}
            autoFocus
            rightSection={<SearchModuleMenu />}
            placeholder={t(`searchEngines.${selectedSearchEngine.value}.description`)}
            value={searchQuery}
            onChange={(currentString) => tryMatchSearchEngine(currentString, setSearchQuery)}
            itemComponent={AutoCompleteItem}
            data={autocompleteData}
            onItemSubmit={(item) => {
              setOpened(false);
              if (item.url) {
                setSearchQuery('');
                window.open(item.openedUrl ? item.openedUrl : item.url, openInNewTab);
              }
            }}
            // Replace %s if it is in selectedSearchEngine.url with searchQuery, otherwise append searchQuery at the end of it
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                searchQuery.length > 0 &&
                autocompleteData.length === 0
              ) {
                if (selectedSearchEngine.url.includes('%s')) {
                  window.open(selectedSearchEngine.url.replace('%s', searchQuery), openInNewTab);
                } else {
                  window.open(selectedSearchEngine.url + searchQuery, openInNewTab);
                }
              }
            }}
            radius="md"
            size="md"
          />
        </Popover.Target>
        <Popover.Dropdown>
          <div>
            <ScrollArea style={{ height: 400, width: 420 }} offsetScrollbars>
              {OverseerrResults.slice(0, 5).map((result, index) => (
                <React.Fragment key={index}>
                  <OverseerrMediaDisplay key={result.id} media={result} />
                  {index < OverseerrResults.length - 1 && <Divider variant="dashed" my="xl" />}
                </React.Fragment>
              ))}
            </ScrollArea>
          </div>
        </Popover.Dropdown>
      </Popover>
    </Box>
  );

  function tryMatchSearchEngine(query: string, setSearchQuery: (value: string) => void) {
    const foundSearchEngine = searchEnginesList.find(
      (engine) => query.includes(`!${engine.shortcut}`) && !engine.disabled
    );
    if (foundSearchEngine) {
      setSearchQuery(query.replace(`!${foundSearchEngine.shortcut}`, ''));
      changeSearchEngine(foundSearchEngine);
    } else {
      setSearchQuery(query);
    }
  }

  function SearchModuleMenu() {
    return (
      <Menu shadow="md" width={200} withinPortal classNames={classes}>
        <Menu.Target>
          <ActionIcon>{selectedSearchEngine.icon}</ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {searchEnginesList.map((item) => (
            <Tooltip
              multiline
              label={item.description}
              withinPortal
              width={200}
              position="left"
              key={item.value}
            >
              <Menu.Item
                key={item.value}
                icon={item.icon}
                rightSection={<Kbd>!{item.shortcut}</Kbd>}
                disabled={item.disabled}
                onClick={() => {
                  changeSearchEngine(item);
                }}
              >
                {item.label}
              </Menu.Item>
            </Tooltip>
          ))}
          <Menu.Divider />
          <Menu.Label>
            <Tip>
              {t('tip')} <Kbd>mod+k</Kbd>{' '}
            </Tip>
          </Menu.Label>
        </Menu.Dropdown>
      </Menu>
    );
  }

  function changeSearchEngine(item: ItemProps) {
    setSearchEngine(item);
    showNotification({
      radius: 'lg',
      disallowClose: true,
      id: 'spotlight',
      autoClose: 1000,
      icon: <ActionIcon size="sm">{item.icon}</ActionIcon>,
      message: t('switchedSearchEngine', { searchEngine: t(`searchEngines.${item.value}.name`) }),
    });
  }
}
