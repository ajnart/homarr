import { Kbd, createStyles, Text, Popover, Autocomplete } from '@mantine/core';
import { useDebouncedValue, useForm, useHotkeys } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import {
  IconSearch as Search,
  IconBrandYoutube as BrandYoutube,
  IconDownload as Download,
} from '@tabler/icons';
import axios from 'axios';
import { useConfig } from '../../../tools/state';
import { IModule } from '../modules';

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
  title: 'Search Bar',
  description: 'Show the current time and date in a card',
  icon: Search,
  component: SearchBar,
};

export default function SearchBar(props: any) {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  const [icon, setIcon] = useState(<Search />);
  const queryUrl = config.settings.searchUrl ?? 'https://www.google.com/search?q=';
  const textInput = useRef<HTMLInputElement>();
  // Find a service with the type of 'Overseerr'
  const form = useForm({
    initialValues: {
      query: '',
    },
  });

  const [debounced, cancel] = useDebouncedValue(form.values.query, 250);
  const [results, setResults] = useState<any[]>([]);
  useEffect(() => {
    if (form.values.query !== debounced || form.values.query === '') return;
    axios
      .get(`/api/modules/search?q=${form.values.query}`)
      .then((res) => setResults(res.data ?? []));
  }, [debounced]);
  useHotkeys([['ctrl+K', () => textInput.current && textInput.current.focus()]]);
  const { classes, cx } = useStyles();
  const rightSection = (
    <div className={classes.hide}>
      <Kbd>Ctrl</Kbd>
      <span style={{ margin: '0 5px' }}>+</span>
      <Kbd>K</Kbd>
    </div>
  );

  // If enabled modules doesn't contain the module, return null
  // If module in enabled

  const exists = config.modules?.[SearchModule.title]?.enabled ?? false;
  if (!exists) {
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
        const isYoutube = query.startsWith('!yt');
        const isTorrent = query.startsWith('!t');
        if (isYoutube) {
          setIcon(<BrandYoutube size={22} />);
        } else if (isTorrent) {
          setIcon(<Download size={22} />);
        } else {
          setIcon(<Search size={22} />);
        }
      }}
      onSubmit={form.onSubmit((values) => {
        const query = values.query.trim();
        const isYoutube = query.startsWith('!yt');
        const isTorrent = query.startsWith('!t');
        form.setValues({ query: '' });
        setTimeout(() => {
          if (isYoutube) {
            window.open(`https://www.youtube.com/results?search_query=${query.substring(3)}`);
          } else if (isTorrent) {
            window.open(`https://bitsearch.to/search?q=${query.substring(3)}`);
          } else {
            window.open(`${queryUrl}${values.query}`);
          }
        }, 20);
      })}
    >
      <Popover
        opened={opened}
        position="bottom"
        placement="start"
        width={260}
        withArrow
        radius="md"
        trapFocus={false}
        transition="pop-bottom-right"
        onFocusCapture={() => setOpened(true)}
        onBlurCapture={() => setOpened(false)}
        target={
          <Autocomplete
            variant="filled"
            data={autocompleteData}
            icon={icon}
            ref={textInput}
            rightSectionWidth={90}
            rightSection={rightSection}
            radius="md"
            size="md"
            styles={{ rightSection: { pointerEvents: 'none' } }}
            placeholder="Search the web..."
            {...props}
            {...form.getInputProps('query')}
          />
        }
      >
        <Text>
          Tip: Use the prefixes <b>!yt</b> and <b>!t</b> in front of your query to search on YouTube
          or for a Torrent respectively.
        </Text>
      </Popover>
    </form>
  );
}
