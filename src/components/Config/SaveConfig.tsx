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
import { t } from 'i18next';

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
    <Group spacing="xs">
      <Modal
        radius="md"
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('settings.tabs.common.settings.configChanger.modal.title')}
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
            label={t('settings.tabs.common.settings.configChanger.modal.form.configName.label')}
            placeholder={t(
              'settings.tabs.common.settings.configChanger.modal.form.configName.placeholder'
            )}
            {...form.getInputProps('configName')}
          />
          <Group position="right" mt="md">
            <Button type="submit">
              {t('settings.tabs.common.settings.configChanger.modal.form.buttons.submit')}
            </Button>
          </Group>
        </form>
      </Modal>
      <Button size="xs" leftIcon={<Download />} variant="outline" onClick={onClick}>
        {t('settings.tabs.common.settings.configChanger.buttons.download')}
      </Button>
      <Button
        size="xs"
        leftIcon={<Trash />}
        variant="outline"
        onClick={() => {
          axios
            .delete(`/api/configs/${config.name}`)
            .then(() => {
              showNotification({
                title: t(
                  'settings.tabs.common.settings.configChanger.buttons.delete.deleted.title'
                ),
                icon: <Check />,
                color: 'green',
                autoClose: 1500,
                radius: 'md',
                message: t(
                  'settings.tabs.common.settings.configChanger.buttons.delete.deleted.message'
                ),
              });
            })
            .catch(() => {
              showNotification({
                title: t(
                  'settings.tabs.common.settings.configChanger.buttons.delete.deleteFailed.title'
                ),
                icon: <X />,
                color: 'red',
                autoClose: 1500,
                radius: 'md',
                message: t(
                  'settings.tabs.common.settings.configChanger.buttons.delete.deleteFailed.message'
                ),
              });
            });
          setConfig({ ...config, name: 'default' });
        }}
      >
        {t('settings.tabs.common.settings.configChanger.buttons.delete.text')}
      </Button>
      <Button size="xs" leftIcon={<Plus />} variant="outline" onClick={() => setOpened(true)}>
        {t('settings.tabs.common.settings.configChanger.buttons.saveCopy')}
      </Button>
    </Group>
  );
}
