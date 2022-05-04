import {
  useMantineTheme,
  Modal,
  Paper,
  Center,
  Group,
  TextInput,
  Image,
  Button,
  Select,
  AspectRatio,
  Box,
  Text,
  Grid,
  Card,
} from '@mantine/core';
import { useForm } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Apps } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { ServiceType, ServiceTypeList } from '../../tools/types';

export default function AddItemShelfItem(props: any) {
  const { config, addService } = useConfig();
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const form = useForm({
    initialValues: {
      type: 'Other',
      name: '',
      icon: '',
      url: '',
      apiKey: undefined as unknown as string,
    },
  });
  return (
    <>
      <Modal
        size="xl"
        radius="lg"
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
        title="Add a service"
      >
        <Center>
          <Image
            height={120}
            width={120}
            src={form.values.icon}
            alt="Placeholder"
            withPlaceholder
          />
        </Center>
        <form
          onSubmit={form.onSubmit(() => {
            addService(form.values);
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
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              error={form.errors.name && 'Invalid name'}
            />

            <TextInput
              required
              label="Icon url"
              placeholder="https://i.gifer.com/ANPC.gif"
              value={form.values.icon}
              onChange={(event) => {
                form.setFieldValue('icon', event.currentTarget.value);
              }}
              error={form.errors.icon && 'Icon url is invalid'}
            />
            <TextInput
              required
              label="Service url"
              placeholder="http://localhost:8989"
              value={form.values.url}
              onChange={(event) => form.setFieldValue('url', event.currentTarget.value)}
              error={form.errors.url && 'Service url is invalid'}
            />
            <Select
              label="Select the type of service (used for API calls)"
              defaultValue="Other"
              placeholder="Pick one"
              value={form.values.type}
              required
              searchable
              onChange={(value) => form.setFieldValue('type', value ?? 'Other')}
              data={ServiceTypeList}
            />
            {(form.values.type === 'Sonarr' || form.values.type === 'Radarr') && (
              <TextInput
                required
                label="API key"
                placeholder="Your API key"
                value={form.values.apiKey}
                onChange={(event) => form.setFieldValue('apiKey', event.currentTarget.value)}
                error={form.errors.apiKey && 'Invalid API key'}
              />
            )}
          </Group>

          <Group grow position="center" mt="xl">
            <Button type="submit">Add service</Button>
          </Group>
        </form>
      </Modal>
      <AspectRatio
        style={{
          minHeight: 120,
          minWidth: 120,
        }}
        ratio={4 / 3}
      >
        <Card
          style={{

            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            width: 200,
            height: 180,
          }}
          radius="md"
        >
          <Group direction="column" position="center">
            <motion.div whileHover={{ scale: 1.2 }}>
              <Apps style={{ cursor: 'pointer' }} onClick={() => setOpened(true)} size={60} />
            </motion.div>
            <Text>Add Service</Text>
          </Group>
        </Card>
      </AspectRatio>
    </>
  );
}
