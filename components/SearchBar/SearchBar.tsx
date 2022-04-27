import { Input, TextInput, Text, ActionIcon, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'tabler-icons-react';
import { Config, loadConfig } from '../../tools/config';

export default function SearchBar(props: any) {
  const theme = useMantineTheme();
  const [config, setConfig] = useState<Config>({
    searchBar: true,
  });

  useEffect(() => {
    const config = loadConfig('settings');
    if (config) {
      showNotification({
        autoClose: 1000,
        title: <Text>Config loaded</Text>,
        message: undefined,
      });
      setConfig(config);
    }
  }, []);
  return (
    <TextInput
      icon={<Search size={18} />}
      radius="xl"
      size="md"
      placeholder="Search the web"
      onChange={(e) => {
        showNotification({
          autoClose: 1000,
          title: <Text>Searching for {e.target.value}</Text>,
          message: undefined,
        });
      }}
      rightSectionWidth={42}
      {...props}
    />
  );
}
