import { Button, Code, Menu, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconEditOff } from '@tabler/icons-react';
import axios from 'axios';
import { Trans, useTranslation } from 'next-i18next';

import { useEditModeInformationStore } from '../../../../hooks/useEditModeInformation';

function ModalContent() {
  const { t } = useTranslation('settings/general/edit-mode-toggle');
  const form = useForm({
    initialValues: {
      triedPassword: '',
    },
  });
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        axios
          .post('/api/configs/tryPassword', { tried: values.triedPassword, type: 'edit' })
          .then((res) => {
            showNotification({
              title: t('notification.success.title'),
              message: t('notification.success.message'),
              color: 'green',
            });
            setTimeout(() => {
              window.location.reload();
            }, 500);
          })
          .catch((_) => {
            showNotification({
              title: t('notification.error.title'),
              message: t('notification.error.message'),
              color: 'red',
            });
          });
      })}
    >
      <Stack>
        <Text size="sm">
          <Trans
            i18nKey={'settings/general/edit-mode-toggle:form.message'}
            components={{ Code: <Code children/> }}
          />
        </Text>
        <PasswordInput
          id="triedPassword"
          label={t('form.label')}
          autoFocus
          required
          {...form.getInputProps('triedPassword')}
        />
        <Button type="submit">{t('form.submit')}</Button>
      </Stack>
    </form>
  );
}

export function EditModeToggle() {
  const { editModeEnabled } = useEditModeInformationStore();
  const Icon = editModeEnabled ? IconEditOff : IconEdit;
  const { t } = useTranslation('settings/general/edit-mode-toggle');

  return (
    <Menu.Item
      closeMenuOnClick={false}
      icon={<Icon strokeWidth={1.2} size={18} />}
      onClick={() =>
        openModal({
          title: t('menu.toggle'),
          centered: true,
          size: 'lg',
          children: <ModalContent />,
        })
      }
    >
      {editModeEnabled ? t('menu.disable') : t('menu.enable')}
    </Menu.Item>
  );
}
