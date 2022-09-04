import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { useState } from 'react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('settings/general/config-changer');
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
      <Modal radius="md" opened={opened} onClose={() => setOpened(false)} title={t('modal.title')}>
        <form
          onSubmit={form.onSubmit((values) => {
            setConfig({ ...config, name: values.configName });
            setOpened(false);
            showNotification({
              title: t('modal.events.configSaved.title'),
              icon: <Check />,
              color: 'green',
              autoClose: 1500,
              radius: 'md',
              message: t('modal.events.configSaved.message', { configName: values.configName }),
            });
          })}
        >
          <TextInput
            required
            label={t('modal.form.configName.label')}
            placeholder={t('modal.form.configName.placeholder')}
            {...form.getInputProps('configName')}
          />
          <Group position="right" mt="md">
            <Button type="submit">{t('modal.form.submitButton')}</Button>
          </Group>
        </form>
      </Modal>
      <Button size="xs" leftIcon={<Download />} variant="outline" onClick={onClick}>
        {t('buttons.download')}
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
                title: t('buttons.delete.notifications.deleted.title'),
                icon: <Check />,
                color: 'green',
                autoClose: 1500,
                radius: 'md',
                message: t('buttons.delete.notifications.deleted.message'),
              });
            })
            .catch(() => {
              showNotification({
                title: t('buttons.delete.notifications.deleteFailed.title'),
                icon: <X />,
                color: 'red',
                autoClose: 1500,
                radius: 'md',
                message: t('buttons.delete.notifications.deleteFailed.message'),
              });
            });
          setConfig({ ...config, name: 'default' });
        }}
      >
        {t('buttons.delete.text')}
      </Button>
      <Button size="xs" leftIcon={<Plus />} variant="outline" onClick={() => setOpened(true)}>
        {t('buttons.saveCopy')}
      </Button>
    </Group>
  );
}
