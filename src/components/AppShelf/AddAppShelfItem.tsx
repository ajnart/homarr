import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Group,
  Image,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Select,
  Stack,
  Switch,
  Tabs,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { IconApps } from '@tabler/icons';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../../tools/state';
import { tryMatchPort, ServiceTypeList, StatusCodes } from '../../tools/types';
import Tip from '../layout/Tip';

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
      <Tooltip label="Add a service">
        <ActionIcon
          variant="default"
          radius="md"
          size="xl"
          color="blue"
          style={props.style}
          onClick={() => setOpened(true)}
        >
          <IconApps />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

function MatchIcon(name: string | undefined, form: any) {
  if (name === undefined || name === '') return null;
  fetch(
    `https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/^dash\.$/, 'dashdot')}.png`
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

const DEFAULT_ICON = '/favicon.svg';

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

  const form = useForm({
    initialValues: {
      id: props.id ?? uuidv4(),
      type: props.type ?? 'Other',
      category: props.category ?? undefined,
      name: props.name ?? '',
      icon: props.icon ?? DEFAULT_ICON,
      url: props.url ?? '',
      apiKey: props.apiKey ?? (undefined as unknown as string),
      username: props.username ?? (undefined as unknown as string),
      password: props.password ?? (undefined as unknown as string),
      openedUrl: props.openedUrl ?? (undefined as unknown as string),
      status: props.status ?? ['200'],
      newTab: props.newTab ?? true,
    },
    validate: {
      apiKey: () => null,
      // Validate icon with a regex
      icon: (value: string) =>
        // Disable matching to allow any values
        null,
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
      },
    },
  });

  const [debounced, cancel] = useDebouncedValue(form.values.name, 250);
  useEffect(() => {
    if (form.values.name !== debounced || form.values.icon !== DEFAULT_ICON) return;
    MatchIcon(form.values.name, form);
    MatchService(form.values.name, form);
    tryMatchPort(form.values.name, form);
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
          if (JSON.stringify(form.values.status) === JSON.stringify(['200'])) {
            form.values.status = undefined;
          }
          if (form.values.newTab === true) {
            form.values.newTab = undefined;
          }
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
        <Tabs defaultValue="Options">
          <Tabs.List grow>
            <Tabs.Tab value="Options">Options</Tabs.Tab>
            <Tabs.Tab value="Advanced Options">Advanced options</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="Options">
            <Stack>
              <TextInput
                required
                label="Service name"
                placeholder="Plex"
                {...form.getInputProps('name')}
              />

              <TextInput
                required
                label="Icon URL"
                placeholder={DEFAULT_ICON}
                {...form.getInputProps('icon')}
              />
              <TextInput
                required
                label="Service URL"
                placeholder="http://localhost:7575"
                {...form.getInputProps('url')}
              />
              <TextInput
                label="On Click URL"
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
                  <Tip>
                    Get your API key{' '}
                    <Anchor
                      target="_blank"
                      weight="bold"
                      style={{ fontStyle: 'inherit', fontSize: 'inherit' }}
                      href={`${hostname}/settings/general`}
                    >
                      here.
                    </Anchor>
                  </Tip>
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
              {form.values.type === 'Deluge' && (
                <>
                  <TextInput
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
              {form.values.type === 'Transmission' && (
                <>
                  <TextInput
                    label="Username"
                    placeholder="admin"
                    value={form.values.username}
                    onChange={(event) => {
                      form.setFieldValue('username', event.currentTarget.value);
                    }}
                    error={form.errors.username && 'Invalid username'}
                  />
                  <TextInput
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
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="Advanced Options">
            <Stack>
              <MultiSelect
                required
                label="HTTP Status Codes"
                data={StatusCodes}
                placeholder="Select valid status codes"
                clearButtonLabel="Clear selection"
                nothingFound="Nothing found"
                defaultValue={['200']}
                clearable
                searchable
                {...form.getInputProps('status')}
              />
              <Switch
                label="Open service in new tab"
                defaultChecked={form.values.newTab}
                {...form.getInputProps('newTab')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
        <Group grow position="center" mt="xl">
          <Button type="submit">{props.message ?? 'Add service'}</Button>
        </Group>
      </form>
    </>
  );
}
