import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { useState } from 'react';
import {
  IconCheck as Check,
  IconDownload as Download,
  IconPlus as Plus,
  IconTrash as Trash,
  IconX as X,
} from '@tabler/icons';
import { useConfig } from '../../tools/state';

export default function SaveConfigComponent(props: any) {
  const [opened, setOpened] = useState(false);
  const { config, setConfig } = useConfig();
  const form = useForm({
    initialValues: {
      configName: config.name,
    },
  });
  function onClick(e: any) {
    if (config) {
      fileDownload(JSON.stringify(config, null, '\t'), `${config.name}.json`);
    }
  }
  return (
    <Group>
      <Modal
        radius="md"
        opened={opened}
        onClose={() => setOpened(false)}
        title="Choose the name of your new config"
      >
        <form
          onSubmit={form.onSubmit((values) => {
            setConfig({ ...config, name: values.configName });
            setOpened(false);
            showNotification({
              title: 'Config saved',
              icon: <Check />,
              color: 'green',
              autoClose: 1500,
              radius: 'md',
              message: `Config saved as ${values.configName}`,
            });
          })}
        >
          <TextInput
            required
            label="Config name"
            placeholder="Your new config name"
            {...form.getInputProps('configName')}
          />
          <Group position="right" mt="md">
            <Button type="submit">Confirm</Button>
          </Group>
        </form>
      </Modal>
      <Button leftIcon={<Download />} variant="outline" onClick={onClick}>
        Download config
      </Button>
      <Button
        leftIcon={<Trash />}
        variant="outline"
        onClick={() => {
          axios
            .delete(`/api/configs/${config.name}`)
            .then(() => {
              showNotification({
                title: 'Config deleted',
                icon: <Check />,
                color: 'green',
                autoClose: 1500,
                radius: 'md',
                message: 'Config deleted',
              });
            })
            .catch(() => {
              showNotification({
                title: 'Config delete failed',
                icon: <X />,
                color: 'red',
                autoClose: 1500,
                radius: 'md',
                message: 'Config delete failed',
              });
            });
          setConfig({ ...config, name: 'default' });
        }}
      >
        Delete config
      </Button>
      <Button leftIcon={<Plus />} variant="outline" onClick={() => setOpened(true)}>
        Save a copy
      </Button>
    </Group>
  );
}
