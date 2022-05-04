import { TextInput, Text, Popover, Box } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { useState } from 'react';
import { Search, BrandYoutube, Download } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';

export default function SearchBar(props: any) {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  const [icon, setIcon] = useState(<Search />);
  const querryUrl = config.settings.searchUrl || 'https://www.google.com/search?q=';

  const form = useForm({
    initialValues: {
      querry: '',
    },
  });

  if (config.settings.searchBar === false) {
    return null;
  }

  return (
    <Box
      style={{
        width: '100%',
      }}
    >
      <form
        onChange={() => {
          // If querry contains !yt or !t add "Searching on YouTube" or "Searching torrent"
          const querry = form.values.querry.trim();
          const isYoutube = querry.startsWith('!yt');
          const isTorrent = querry.startsWith('!t');
          if (isYoutube) {
            setIcon(<BrandYoutube size={22} />);
          } else if (isTorrent) {
            setIcon(<Download size={22} />);
          } else {
            setIcon(<Search size={22} />);
          }
        }}
        onSubmit={form.onSubmit((values) => {
          // Find if querry is prefixed by !yt or !t
          const querry = values.querry.trim();
          const isYoutube = querry.startsWith('!yt');
          const isTorrent = querry.startsWith('!t');
          if (isYoutube) {
            window.open(`https://www.youtube.com/results?search_query=${querry.substring(3)}`);
          } else if (isTorrent) {
            window.open(`https://thepiratebay.org/search.php?q=${querry.substring(3)}`);
          } else {
            window.open(`${querryUrl}${values.querry}`);
          }
        })}
      >
        <Popover
          opened={opened}
          style={{
            width: '100%',
          }}
          position="bottom"
          placement="start"
          withArrow
          trapFocus={false}
          transition="pop-top-left"
          onFocusCapture={() => setOpened(true)}
          onBlurCapture={() => setOpened(false)}
          target={
            <TextInput
              variant="filled"
              color="blue"
              icon={icon}
              radius="md"
              size="md"
              placeholder="Search the web"
              {...props}
              {...form.getInputProps('querry')}
            />
          }
        >
          <Text>
            tip: You can prefix your querry with <b>!yt</b> or <b>!t</b> to research on youtube or
            for a torrent
          </Text>
        </Popover>
      </form>
    </Box>
  );
}
