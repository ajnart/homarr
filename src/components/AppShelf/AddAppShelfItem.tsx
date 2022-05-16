import {
  Modal,
  Center,
  Group,
  TextInput,
  Image,
  Button,
  Select,
  AspectRatio,
  Text,
  Card,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Apps } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { ServiceTypeList } from '../../tools/types';
import { AppShelfItemWrapper } from './AppShelfItemWrapper';

export function AddItemShelfButton(props: any) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="md"
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

export default function AddItemShelfItem(props: any) {
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
        title="Add a service"
      >
        <AddAppShelfItemForm setOpened={setOpened} />
      </Modal>
      <AppShelfItemWrapper>
        <Card.Section>
          <Group position="center" mx="lg">
            <Text
              // TODO: #1 Remove this hack to get the text to be centered.
              ml={15}
              style={{
                alignSelf: 'center',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
              mt="sm"
              weight={500}
            >
              Add a service
            </Text>
          </Group>
        </Card.Section>
        <Card.Section>
          <AspectRatio ratio={5 / 3} m="xl">
            <motion.i
              whileHover={{
                cursor: 'pointer',
                scale: 1.1,
              }}
            >
              <Apps style={{ cursor: 'pointer' }} onClick={() => setOpened(true)} size={60} />
            </motion.i>
          </AspectRatio>
        </Card.Section>
      </AppShelfItemWrapper>
    </>
  );
}

function MatchIcon(name: string, form: any) {
  fetch(
    `https://cdn.jsdelivr.net/gh/walkxhub/dashboard-icons/png/${name
      .replace(/\s+/g, '-')
      .toLowerCase()}.png`
  )
    .then((res) => {
      if (res.status === 200) {
        form.setFieldValue('icon', res.url);
      }
    })
    .catch(() => {
      // Do nothing
    });

  return false;
}

export function AddAppShelfItemForm(props: { setOpened: (b: boolean) => void } & any) {
  const { setOpened } = props;
  const { config, setConfig } = useConfig();
  const [isLoading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      type: props.type ?? 'Other',
      name: props.name ?? '',
      icon: props.icon ?? '',
      url: props.url ?? '',
      apiKey: props.apiKey ?? (undefined as unknown as string),
    },
    validate: {
      apiKey: () => null,
      // Validate icon with a regex
      icon: (value: string) => {
        if (!value.match(/^https?:\/\/.+\.(png|jpg|jpeg|gif)$/)) {
          return 'Please enter a valid icon URL';
        }
        return null;
      },
      // Validate url with a regex http/https
      url: (value: string) => {
        if (!value.match(/^https?:\/\/.+\/$/)) {
          return 'Please enter a valid URL (that ends with a /)';
        }
        return null;
      },
    },
  });

  return (
    <>
      <Center>
        <Image height={120} width={120} src={form.values.icon} alt="Placeholder" withPlaceholder />
      </Center>
      <form
        onSubmit={form.onSubmit(() => {
          // If service already exists, update it.
          if (config.services && config.services.find((s) => s.name === form.values.name)) {
            setConfig({
              ...config,
              services: config.services.map((s) => {
                if (s.name === form.values.name) {
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
            value={form.values.name}
            onChange={(event) => {
              form.setFieldValue('name', event.currentTarget.value);
              const match = MatchIcon(event.currentTarget.value, form);
              if (match) {
                form.setFieldValue('icon', match);
              }
            }}
            error={form.errors.name && 'Invalid icon url'}
          />

          <TextInput
            required
            label="Icon url"
            placeholder="https://i.gifer.com/ANPC.gif"
            {...form.getInputProps('icon')}
          />
          <TextInput
            required
            label="Service url"
            placeholder="http://localhost:8989"
            {...form.getInputProps('url')}
          />
          <Select
            label="Select the type of service (used for API calls)"
            defaultValue="Other"
            placeholder="Pick one"
            required
            searchable
            data={ServiceTypeList}
            {...form.getInputProps('type')}
          />
          <LoadingOverlay visible={isLoading} />
          {(form.values.type === 'Sonarr' || form.values.type === 'Radarr') && (
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
          )}
        </Group>

        <Group grow position="center" mt="xl">
          <Button type="submit">{props.message ?? 'Add service'}</Button>
        </Group>
      </form>
    </>
  );
}
