import { TextInput, Kbd, createStyles, Text, Popover } from '@mantine/core';
import { useForm, useHotkeys } from '@mantine/hooks';
import { useRef, useState } from 'react';
import { Search, BrandYoutube, Download } from 'tabler-icons-react';
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
  const queryUrl = config.settings.searchUrl || 'https://www.google.com/search?q=';
  const textInput = useRef<HTMLInputElement>();
  useHotkeys([['ctrl+K', () => textInput.current && textInput.current.focus()]]);

  const { classes, cx } = useStyles();
  const rightSection = (
    <div className={classes.hide}>
      <Kbd>Ctrl</Kbd>
      <span style={{ margin: '0 5px' }}>+</span>
      <Kbd>K</Kbd>
    </div>
  );

  const form = useForm({
    initialValues: {
      query: '',
    },
  });

  // If enabled modules doesn't contain the module, return null
  // If module in enabled

  const exists = config.modules?.[SearchModule.title]?.enabled ?? false;
  if (!exists) {
    return null;
  }

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
          <TextInput
            variant="filled"
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
          tip: Use the prefixes <b>!yt</b> and <b>!t</b> in front of your query to search on YouTube
          or for a Torrent respectively.
        </Text>
      </Popover>
    </form>
  );
}
