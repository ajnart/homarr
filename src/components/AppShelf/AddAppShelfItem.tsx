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
  PasswordInput,
  Select,
  Space,
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
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../../tools/state';
import { tryMatchPort, ServiceTypeList, StatusCodes, Config } from '../../tools/types';
import apiKeyPaths from './apiKeyPaths.json';
import Tip from '../layout/Tip';

export function AddItemShelfButton(props: any) {
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  const { t } = useTranslation('layout/add-service-app-shelf');
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        title={<Title order={3}>{t('modal.title')}</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <AddAppShelfItemForm config={config} setConfig={setConfig} setOpened={setOpened} />
      </Modal>
      <Tooltip withinPortal label={t('actionIcon.tooltip')}>
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
    `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${name
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

const DEFAULT_ICON = '/imgs/favicon/favicon.png';

interface AddAppShelfItemFormProps {
  setOpened: (b: boolean) => void;
  config: Config;
  setConfig: (config: Config) => void;
  // Any other props you want to pass to the form
  [key: string]: any;
}

export function AddAppShelfItemForm(props: AddAppShelfItemFormProps) {
  const { setOpened, config, setConfig } = props;
  // Only get config and setConfig from useCOnfig if they are not present in props
  const [isLoading, setLoading] = useState(false);
  const { t } = useTranslation('layout/add-service-app-shelf');

  // Extract all the categories from the services in config
  const InitialCategories = config.services.reduce((acc, cur) => {
    if (cur.category && !acc.includes(cur.category)) {
      acc.push(cur.category);
    }
    return acc;
  }, [] as string[]);
  const [categories, setCategories] = useState<string[]>(InitialCategories);

  const form = useForm({
    initialValues: {
      id: props.id ?? uuidv4(),
      type: props.type ?? 'Other',
      category: props.category ?? null,
      name: props.name ?? '',
      icon: props.icon ?? DEFAULT_ICON,
      url: props.url ?? '',
      apiKey: props.apiKey ?? undefined,
      username: props.username ?? undefined,
      password: props.password ?? undefined,
      openedUrl: props.openedUrl ?? undefined,
      ping: props.ping ?? true,
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
          return t('modal.form.validation.invalidUrl');
        }
        return null;
      },
      status: (value: string[]) => {
        if (!value.length) {
          return t('modal.form.validation.noStatusCodeSelected');
        }
        return null;
      },
    },
  });

  const [debounced, cancel] = useDebouncedValue(form.values.name, 250);
  useEffect(() => {
    if (
      form.values.name !== debounced ||
      form.values.icon !== DEFAULT_ICON ||
      form.values.type !== 'Other'
    ) {
      return;
    }
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
      <Center mb="lg">
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
          const newForm = { ...form.values };
          if (newForm.newTab === true) newForm.newTab = undefined;
          if (newForm.openedUrl === '') newForm.openedUrl = undefined;
          if (newForm.category === null) newForm.category = undefined;
          if (newForm.ping === true) newForm.ping = undefined;
          if (
            (newForm.status.length === 1 && newForm.status[0] === '200') ||
            newForm.ping === false
          ) {
            delete newForm.status;
          }
          // If service already exists, update it.
          if (config.services && config.services.find((s) => s.id === newForm.id)) {
            setConfig({
              ...config,
              // replace the found item by matching ID
              services: config.services.map((s) => {
                if (s.id === newForm.id) {
                  return {
                    ...newForm,
                  };
                }
                return s;
              }),
            });
          } else {
            setConfig({
              ...config,
              services: [...config.services, newForm],
            });
          }
          setOpened(false);
          form.reset();
        })}
      >
        <Tabs defaultValue="Options">
          <Tabs.List grow>
            <Tabs.Tab value="Options">{t('modal.tabs.options.title')}</Tabs.Tab>
            <Tabs.Tab value="Advanced Options">{t('modal.tabs.advancedOptions.title')}</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="Options">
            <Space h="sm" />
            <Stack>
              <TextInput
                required
                label={t('modal.tabs.options.form.serviceName.label')}
                placeholder={t('modal.tabs.options.form.serviceName.placeholder')}
                {...form.getInputProps('name')}
              />
              <TextInput
                required
                label={t('modal.tabs.options.form.iconUrl.label')}
                placeholder={DEFAULT_ICON}
                {...form.getInputProps('icon')}
              />
              <TextInput
                required
                label={t('modal.tabs.options.form.serviceUrl.label')}
                placeholder="http://localhost:7575"
                {...form.getInputProps('url')}
              />
              <TextInput
                label={t('modal.tabs.options.form.onClickUrl.label')}
                placeholder="http://sonarr.example.com"
                {...form.getInputProps('openedUrl')}
              />
              <Select
                label={t('modal.tabs.options.form.serviceType.label')}
                defaultValue={t('modal.tabs.options.form.serviceType.defaultValue')}
                placeholder={t('modal.tabs.options.form.serviceType.placeholder')}
                required
                searchable
                data={ServiceTypeList}
                {...form.getInputProps('type')}
              />
              <Select
                label={t('modal.tabs.options.form.category.label')}
                data={categories}
                placeholder={t('modal.tabs.options.form.category.placeholder')}
                nothingFound={t('modal.tabs.options.form.category.nothingFound')}
                searchable
                clearable
                creatable
                onCreate={(query) => {
                  const item = { value: query, label: query };
                  setCategories([...InitialCategories, query]);
                  return item;
                }}
                getCreateLabel={(query) =>
                  t('modal.tabs.options.form.category.createLabel', {
                    query,
                  })
                }
                {...form.getInputProps('category')}
              />
              <LoadingOverlay visible={isLoading} />
              {(form.values.type === 'Sonarr' ||
                form.values.type === 'Radarr' ||
                form.values.type === 'Lidarr' ||
                form.values.type === 'Overseerr' ||
                form.values.type === 'Jellyseerr' ||
                form.values.type === 'Readarr' ||
                form.values.type === 'Sabnzbd') && (
                <>
                  <TextInput
                    required
                    label={t('modal.tabs.options.form.integrations.apiKey.label')}
                    placeholder={t('modal.tabs.options.form.integrations.apiKey.placeholder')}
                    value={form.values.apiKey}
                    onChange={(event) => {
                      form.setFieldValue('apiKey', event.currentTarget.value);
                    }}
                    error={
                      form.errors.apiKey &&
                      t('modal.tabs.options.form.integrations.apiKey.validation.noKey')
                    }
                  />
                  <Tip>
                    {t('modal.tabs.options.form.integrations.apiKey.tip.text')}{' '}
                    <Anchor
                      target="_blank"
                      weight="bold"
                      style={{ fontStyle: 'inherit', fontSize: 'inherit' }}
                      href={`${hostname}/${
                        apiKeyPaths[form.values.type as keyof typeof apiKeyPaths]
                      }`}
                    >
                      {t('modal.tabs.options.form.integrations.apiKey.tip.link')}
                    </Anchor>
                  </Tip>
                </>
              )}
              {form.values.type === 'qBittorrent' && (
                <>
                  <TextInput
                    label={t('modal.tabs.options.form.integrations.qBittorrent.username.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.qBittorrent.username.placeholder'
                    )}
                    value={form.values.username}
                    onChange={(event) => {
                      form.setFieldValue('username', event.currentTarget.value);
                    }}
                    error={
                      form.errors.username &&
                      t(
                        'modal.tabs.options.form.integrations.qBittorrent.username.validation.invalidUsername'
                      )
                    }
                  />
                  <PasswordInput
                    label={t('modal.tabs.options.form.integrations.qBittorrent.password.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.qBittorrent.password.placeholder'
                    )}
                    value={form.values.password}
                    onChange={(event) => {
                      form.setFieldValue('password', event.currentTarget.value);
                    }}
                    error={
                      form.errors.password &&
                      t(
                        'modal.tabs.options.form.integrations.qBittorrent.password.validation.invalidPassword'
                      )
                    }
                  />
                </>
              )}
              {form.values.type === 'Deluge' && (
                <>
                  <PasswordInput
                    label={t('modal.tabs.options.form.integrations.deluge.password.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.deluge.password.placeholder'
                    )}
                    value={form.values.password}
                    onChange={(event) => {
                      form.setFieldValue('password', event.currentTarget.value);
                    }}
                    error={
                      form.errors.password &&
                      t(
                        'modal.tabs.options.form.integrations.deluge.password.validation.invalidPassword'
                      )
                    }
                  />
                </>
              )}
              {form.values.type === 'Transmission' && (
                <>
                  <TextInput
                    label={t('modal.tabs.options.form.integrations.transmission.username.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.transmission.username.placeholder'
                    )}
                    value={form.values.username}
                    onChange={(event) => {
                      form.setFieldValue('username', event.currentTarget.value);
                    }}
                    error={
                      form.errors.username &&
                      t(
                        'modal.tabs.options.form.integrations.transmission.username.validation.invalidUsername'
                      )
                    }
                  />
                  <PasswordInput
                    label={t('modal.tabs.options.form.integrations.transmission.password.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.transmission.password.placeholder'
                    )}
                    value={form.values.password}
                    onChange={(event) => {
                      form.setFieldValue('password', event.currentTarget.value);
                    }}
                    error={
                      form.errors.password &&
                      t(
                        'modal.tabs.options.form.integrations.transmission.password.validation.invalidPassword'
                      )
                    }
                  />
                </>
              )}
              {form.values.type === 'NZBGet' && (
                <>
                  <TextInput
                    label={t('modal.tabs.options.form.integrations.nzbget.username.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.nzbget.username.placeholder'
                    )}
                    value={form.values.username}
                    onChange={(event) => {
                      form.setFieldValue('username', event.currentTarget.value);
                    }}
                    error={
                      form.errors.username &&
                      t(
                        'modal.tabs.options.form.integrations.nzbget.username.validation.invalidUsername'
                      )
                    }
                  />
                  <PasswordInput
                    label={t('modal.tabs.options.form.integrations.nzbget.password.label')}
                    placeholder={t(
                      'modal.tabs.options.form.integrations.nzbget.password.placeholder'
                    )}
                    value={form.values.password}
                    onChange={(event) => {
                      form.setFieldValue('password', event.currentTarget.value);
                    }}
                    error={
                      form.errors.password &&
                      t(
                        'modal.tabs.options.form.integrations.nzbget.password.validation.invalidPassword'
                      )
                    }
                  />
                </>
              )}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="Advanced Options">
            <Space h="sm" />
            <Stack>
              <Switch
                label={t('modal.tabs.advancedOptions.form.ping.label')}
                defaultChecked={form.values.ping}
                {...form.getInputProps('ping')}
              />
              {form.values.ping && (
                <MultiSelect
                  required
                  label={t('modal.tabs.advancedOptions.form.httpStatusCodes.label')}
                  data={StatusCodes}
                  placeholder={t('modal.tabs.advancedOptions.form.httpStatusCodes.placeholder')}
                  clearButtonLabel={t(
                    'modal.tabs.advancedOptions.form.httpStatusCodes.clearButtonLabel'
                  )}
                  nothingFound={t('modal.tabs.advancedOptions.form.httpStatusCodes.nothingFound')}
                  defaultValue={['200']}
                  clearable
                  searchable
                  {...form.getInputProps('status')}
                />
              )}
              <Switch
                label={t('modal.tabs.advancedOptions.form.openServiceInNewTab.label')}
                defaultChecked={form.values.newTab}
                {...form.getInputProps('newTab')}
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
        <Group grow position="center" mt="xl">
          <Button type="submit">
            {props.message ?? t('modal.tabs.advancedOptions.form.buttons.submit.content')}
          </Button>
        </Group>
      </form>
    </>
  );
}
