import { Kbd, createStyles, Autocomplete, Popover, ScrollArea, Divider } from '@mantine/core';
import { useClickOutside, useDebouncedValue, useHotkeys } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import React, { useEffect, useRef, useState } from 'react';
import {
  IconSearch as Search,
  IconBrandYoutube as BrandYoutube,
  IconDownload as Download,
  IconMovie,
} from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';
import { useConfig } from '../../tools/state';
import { IModule } from '../ModuleTypes';
import { OverseerrModule } from '../overseerr';
import { OverseerrMediaDisplay } from '../common';

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
    display: 'flex',
    alignItems: 'center',
  },
}));

export const SearchModule: IModule = {
  title: 'Search',
  icon: Search,
  component: SearchBar,
  translationNamespace: 'modules/search-module',
};

export default function SearchBar(props: any) {
  const { classes, cx } = useStyles();
  // Config
  const { config } = useConfig();
  const isModuleEnabled = config.modules?.[SearchModule.title]?.enabled ?? false;
  const isOverseerrEnabled = config.modules?.[OverseerrModule.title]?.enabled ?? false;
  const OverseerrService = config.services.find(
    (service) => service.type === 'Overseerr' || service.type === 'Jellyseerr'
  );
  const queryUrl = config.settings.searchUrl ?? 'https://www.google.com/search?q=';

  const [OverseerrResults, setOverseerrResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [icon, setIcon] = useState(<Search />);
  const [results, setResults] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);
  const ref = useClickOutside(() => setOpened(false));

  const textInput = useRef<HTMLInputElement>();
  useHotkeys([['ctrl+K', () => textInput.current && textInput.current.focus()]]);

  const form = useForm({
    initialValues: {
      query: '',
    },
  });
  const [debounced, cancel] = useDebouncedValue(form.values.query, 250);
  const { t } = useTranslation('modules/search-module');

  useEffect(() => {
    if (OverseerrService === undefined && isOverseerrEnabled) {
      showNotification({
        title: 'Overseerr integration',
        message:
          'Module enabled but no service is configured with the type "Overseerr" / "Jellyseerr"',
        color: 'red',
      });
    }
  }, [OverseerrService, isOverseerrEnabled]);

  useEffect(() => {
    if (
      form.values.query !== debounced ||
      form.values.query === '' ||
      (form.values.query.startsWith('!') && !form.values.query.startsWith('!os'))
    ) {
      return;
    }
    if (form.values.query.startsWith('!os')) {
      axios
        .get(`/api/modules/overseerr?query=${form.values.query.replace('!os', '').trim()}`)
        .then((res) => {
          setOverseerrResults(res.data.results ?? []);
          setLoading(false);
        });
      setLoading(true);
    } else {
      setOverseerrResults([]);
      axios
        .get(`/api/modules/search?q=${form.values.query}`)
        .then((res) => setResults(res.data ?? []));
    }
  }, [debounced]);

  if (!isModuleEnabled) {
    return null;
  }

  const autocompleteData = results.map((result) => ({
    label: result.phrase,
    value: result.phrase,
  }));
  return (
    <form
      onChange={() => {
        // If query contains !yt or !t add "Searching on YouTube" or "Searching torrent"
        const query = form.values.query.trim();
        switch (query.substring(0, 3)) {
          case '!yt':
            setIcon(<BrandYoutube />);
            break;
          case '!t ':
            setIcon(<Download />);
            break;
          case '!os':
            setIcon(<IconMovie />);
            break;
          default:
            setIcon(<Search />);
            break;
        }
      }}
      onSubmit={form.onSubmit((values) => {
        const query = values.query.trim();
        setTimeout(() => {
          form.setValues({ query: '' });
          switch (query.substring(0, 3)) {
            case '!yt':
              window.open(`https://www.youtube.com/results?search_query=${query.substring(3)}`);
              break;
            case '!t ':
              window.open(`https://www.torrentdownloads.me/search/?search=${query.substring(3)}`);
              break;
            case '!os':
              break;
            default:
              window.open(
                `${queryUrl.includes('%s') ? queryUrl.replace('%s', query) : `${queryUrl}${query}`}`
              );
              break;
          }
        }, 500);
      })}
    >
      <Popover
        opened={OverseerrResults.length > 0 && opened}
        position="bottom"
        withArrow
        withinPortal
        shadow="md"
        radius="md"
        zIndex={100}
        trapFocus
        transition="pop-top-right"
      >
        <Popover.Target>
          <Autocomplete
            onFocusCapture={() => setOpened(true)}
            autoFocus
            variant="filled"
            data={autocompleteData}
            icon={icon}
            ref={textInput}
            rightSectionWidth={90}
            rightSection={
              <div className={classes.hide}>
                <Kbd>Ctrl</Kbd>
                <span style={{ margin: '0 5px' }}>+</span>
                <Kbd>K</Kbd>
              </div>
            }
            radius="md"
            size="md"
            styles={{ rightSection: { pointerEvents: 'none' } }}
            placeholder={t('input.placeholder')}
            {...props}
            {...form.getInputProps('query')}
          />
        </Popover.Target>

        <Popover.Dropdown>
          <div ref={ref}>
            <ScrollArea style={{ height: 400, width: 400 }} offsetScrollbars>
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
    </form>
  );
}
