import { Button, Code, Menu, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { openModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconEdit, IconEditOff } from '@tabler/icons';
import axios from 'axios';
import { useEditModeInformationStore } from '../../../../hooks/useEditModeInformation';

function ModalContent() {
  const form = useForm({
    initialValues: {
      triedPassword: '',
    },
  });
  return (
    <form
      onSubmit={form.onSubmit((values) => {
        axios.post('/api/configs/tryToggleEdit', { tried: values.triedPassword }).then((res) => {
          if (res.data.success) {
            showNotification({
              title: 'Success',
              message: 'Successfully toggled edit mode, reloading the page...',
              color: 'green',
            });
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            showNotification({
              title: 'Wrong password',
              message: 'The password you entered is wrong.',
              color: 'red',
            });
          }
        });
      })}
    >
      <Stack>
        <Text size="sm">
          In order to toggle edit mode, you need to enter the password you entered in the
          environment variable named <Code>EDIT_MODE_PASSWORD</Code>
        </Text>
        <PasswordInput
          id="triedPassword"
          label="Edit password"
          autoFocus
          required
          {...form.getInputProps('triedPassword')}
        />
        <Button type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}

export function EditModeToggle() {
  const { editModeEnabled } = useEditModeInformationStore();
  const Icon = editModeEnabled ? IconEdit : IconEditOff;

  return (
    <Menu.Item
      closeMenuOnClick={false}
      icon={<Icon strokeWidth={1.2} size={18} />}
      onClick={() =>
        openModal({
          title: 'Toggle edit mode',
          centered: true,
          size: 'lg',
          children: <ModalContent />,
        })
      }
    >
      {editModeEnabled ? 'Enable edit mode' : 'Disable edit mode'}
    </Menu.Item>
  );
}
