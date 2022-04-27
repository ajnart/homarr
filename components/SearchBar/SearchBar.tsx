import { Input, TextInput, Text, ActionIcon, useMantineTheme, Center } from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useState, useEffect } from 'react';
import { Search, ArrowRight, ArrowLeft } from 'tabler-icons-react';
import { Config, loadConfig } from '../../tools/config';

export default function SearchBar(props: any) {
  const theme = useMantineTheme();
  const [config, setConfig] = useState<Config>({
    searchBar: true,
    searchUrl: 'https://www.google.com/search?q=',
  });

  const querryUrl = config.searchUrl || 'https://www.google.com/search?q=';

  const form = useForm({
    initialValues: {
      querry: '',
    },
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

  if (!config.searchBar) {
    return null;
  }

  return (
    <form onSubmit={form.onSubmit((values) => window.open(`${querryUrl}${values.querry}`))}>
      <TextInput
        icon={<Search size={18} />}
        radius="xl"
        size="md"
        placeholder="Search the web"
        {...props}
        {...form.getInputProps('querry')}
      />
    </form>
  );
}
