import {
  Modal,
  Center,
  Group,
  TextInput,
  Image,
  Button,
  Select,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  Title,
  Anchor,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { IconApps as Apps } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import { useDebouncedValue } from '@mantine/hooks';
import { useConfig } from '../../tools/state';
import { ServiceTypeList } from '../../tools/types';
import { MultiSelect } from '@mantine/core';

export function AddItemShelfButton(props: any) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        title={<Title order={3}>Add service</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <AddAppShelfItemForm setOpened={setOpened} />
      </Modal>
      <ActionIcon
        variant="default"
        radius="md"
        size="xl"
        color="blue"
        style={props.style}
        onClick={() => setOpened(true)}
      >
        <Tooltip label="Add a service">
          <Apps />
        </Tooltip>
      </ActionIcon>
    </>
  );
}

function MatchIcon(name: string, form: any) {
  fetch(
    `https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`
  ).then((res) => {
    if (res.ok) {
      form.setFieldValue('icon', res.url);
    }
  });

  return false;
}

function MatchService(name: string, form: any) {
  const service = ServiceTypeList.find((s) => s.toLowerCase() === name.toLowerCase());
  if (service) {
    form.setFieldValue('type', service);
  }
}

function MatchPort(name: string, form: any) {
  const portmap = [
    { name: 'qbittorrent', value: '8080' },
    { name: 'sonarr', value: '8989' },
    { name: 'radarr', value: '7878' },
    { name: 'lidarr', value: '8686' },
    { name: 'readarr', value: '8686' },
    { name: 'deluge', value: '8112' },
    { name: 'transmission', value: '9091' },
  ];
  // Match name with portmap key
  const port = portmap.find((p) => p.name === name.toLowerCase());
  if (port) {
    form.setFieldValue('url', `http://localhost:${port.value}`);
  }
}

export function AddAppShelfItemForm(props: { setOpened: (b: boolean) => void } & any) {
  const { setOpened } = props;
  const { config, setConfig } = useConfig();
  const [isLoading, setLoading] = useState(false);

  // Extract all the categories from the services in config
  const categoryList = config.services.reduce((acc, cur) => {
    if (cur.category && !acc.includes(cur.category)) {
      acc.push(cur.category);
    }
    return acc;
  }, [] as string[]);

  const statusCodes = [
    {value: '200', label: '200 - OK', group:'Sucessful responses'}, 
    {value: '204', label: '204 - No Content', group:'Sucessful responses'},
    {value: '301', label: '301 - Moved Permanently', group:'Redirection responses'},
    {value: '302', label: '302 - Found / Moved Temporarily', group:'Redirection responses'},
    {value: '304', label: '304 - Not Modified', group:'Redirection responses'},
    {value: '307', label: '307 - Temporary Redirect', group:'Redirection responses'},
    {value: '308', label: '308 - Permanent Redirect', group:'Redirection responses'},
    {value: '400', label: '400 - Bad Request', group:'Client error responses'},
    {value: '401', label: '401 - Unauthorized', group:'Client error responses'},
    {value: '403', label: '403 - Forbidden', group:'Client error responses'},
    {value: '404', label: '404 - Not Found', group:'Client error responses'},
    {value: '408', label: '408 - Request Timeout', group:'Client error responses'},
    {value: '410', label: '410 - Gone', group:'Client error responses'},
    {value: '429', label: '429 - Too Many Requests', group:'Client error responses'},
    {value: '500', label: '500 - Internal Server Error', group:'Server error responses'},
    {value: '502', label: '502 - Bad Gateway', group:'Server error responses'},
    {value: '503', label: '503 - Service Unavailable', group:'Server error responses'},
    {value: '504', label: '504 - Gateway Timeout Error', group:'Server error responses'},
    ];

  const form = useForm({
    initialValues: {
      id: props.id ?? uuidv4(),
      type: props.type ?? 'Other',
      category: props.category ?? undefined,
      name: props.name ?? '',
      icon: props.icon ?? '/favicon.svg',
      url: props.url ?? '',
      apiKey: props.apiKey ?? (undefined as unknown as string),
      username: props.username ?? (undefined as unknown as string),
      password: props.password ?? (undefined as unknown as string),
      openedUrl: props.openedUrl ?? (undefined as unknown as string),
      status: props.status ?? ['200'],
    },
    validate: {
      apiKey: () => null,
      // Validate icon with a regex
      icon: (value: string) => {
        // Regex to match everything that ends with and icon extension
        if (!value.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
          return 'Please enter a valid icon URL';
        }
        return null;
      },
      // Validate url with a regex http/https
      url: (value: string) => {
        try {
          const _isValid = new URL(value);
        } catch (e) {
          return 'Please enter a valid URL';
        }
        return null;
      },
      status: (value: string[]) => {
        if (!value.length) {
          return 'Please select a status code';
        }
        return null;
      }
    },
  });

  const [debounced, cancel] = useDebouncedValue(form.values.name, 250);
  useEffect(() => {
    if (form.values.name !== debounced || props.name || props.type) return;
    MatchIcon(form.values.name, form);
    MatchService(form.values.name, form);
    MatchPort(form.values.name, form);
  }, [debounced]);

  // Try to set const hostname to new URL(form.values.url).hostname)
  // If it fails, set it to the form.values.url
  let hostname = form.values.url;
  try {
    hostname = new URL(form.values.url).origin;
  } catch (e) {
    // Do nothing
  }

  return (
    <>
      <Center>
        <Image
          height={120}
          width={120}
          fit="contain"
          src={form.values.icon}
          alt="Placeholder"
          withPlaceholder
        />
      </Center>
      <form
        onSubmit={form.onSubmit(() => {
          // If service already exists, update it.
          if (config.services && config.services.find((s) => s.id === form.values.id)) {
            setConfig({
              ...config,
              // replace the found item by matching ID
              services: config.services.map((s) => {
                if (s.id === form.values.id) {
                  return {
                    ...form.values,
                  };
                }
                return s;
              }),
            });
          } else {
            setConfig({
              ...config,
              services: [...config.services, form.values],
            });
          }
          setOpened(false);
          form.reset();
        })}
      >
        <Group direction="column" grow>
          <TextInput
            required
            label="Service name"
            placeholder="Plex"
            {...form.getInputProps('name')}
          />

          <TextInput
            required
            label="Icon URL"
            placeholder="/favicon.svg"
            {...form.getInputProps('icon')}
          />
          <TextInput
            required
            label="Service URL"
            placeholder="http://localhost:7575"
            {...form.getInputProps('url')}
          />
          <TextInput
            label="New tab URL"
            placeholder="http://sonarr.example.com"
            {...form.getInputProps('openedUrl')}
          />
          <Select
            label="Service type"
            defaultValue="Other"
            placeholder="Pick one"
            required
            searchable
            data={ServiceTypeList}
            {...form.getInputProps('type')}
          />
          <Select
            label="Category"
            data={categoryList}
            placeholder="Select a category or create a new one"
            nothingFound="Nothing found"
            searchable
            clearable
            creatable
            onClick={(e) => {
              e.preventDefault();
            }}
            getCreateLabel={(query) => `+ Create "${query}"`}
            onCreate={(query) => {}}
            {...form.getInputProps('category')}
          />
          <MultiSelect
          required 
          label="HTTP Status Codes"
          data={statusCodes}
          placeholder="Select valid status codes"
          clearButtonLabel="Clear selection"
          nothingFound="Nothing found"
          clearable
          searchable
          {...form.getInputProps('status')}
          />
          <LoadingOverlay visible={isLoading} />
          {(form.values.type === 'Sonarr' ||
            form.values.type === 'Radarr' ||
            form.values.type === 'Lidarr' ||
            form.values.type === 'Readarr') && (
            <>
              <TextInput
                required
                label="API key"
                placeholder="Your API key"
                value={form.values.apiKey}
                onChange={(event) => {
                  form.setFieldValue('apiKey', event.currentTarget.value);
                }}
                error={form.errors.apiKey && 'Invalid API key'}
              />
              <Text
                style={{
                  alignSelf: 'center',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  color: 'gray',
                }}
              >
                Tip: Get your API key{' '}
                <Anchor
                  target="_blank"
                  weight="bold"
                  style={{ fontStyle: 'inherit', fontSize: 'inherit' }}
                  href={`${hostname}/settings/general`}
                >
                  here.
                </Anchor>
              </Text>
            </>
          )}
          {form.values.type === 'qBittorrent' && (
            <>
              <TextInput
                required
                label="Username"
                placeholder="admin"
                value={form.values.username}
                onChange={(event) => {
                  form.setFieldValue('username', event.currentTarget.value);
                }}
                error={form.errors.username && 'Invalid username'}
              />
              <TextInput
                required
                label="Password"
                placeholder="adminadmin"
                value={form.values.password}
                onChange={(event) => {
                  form.setFieldValue('password', event.currentTarget.value);
                }}
                error={form.errors.password && 'Invalid password'}
              />
            </>
          )}
          {(form.values.type === 'Deluge' || form.values.type === 'Transmission') && (
            <>
              <TextInput
                required
                label="Password"
                placeholder="password"
                value={form.values.password}
                onChange={(event) => {
                  form.setFieldValue('password', event.currentTarget.value);
                }}
                error={form.errors.password && 'Invalid password'}
              />
            </>
          )}
        </Group>

        <Group grow position="center" mt="xl">
          <Button type="submit">{props.message ?? 'Add service'}</Button>
        </Group>
      </form>
    </>
  );
}
