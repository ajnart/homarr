import { Menu, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Check, Trash } from 'tabler-icons-react';

export default function AppShelfMenu(props: any) {
  const { name, removeitem: removeItem } = props;
  return (
    <Menu sx={{ position: 'absolute', top: 3, right: 3 }}>
      <Menu.Label>Settings</Menu.Label>

      <Menu.Label>Danger zone</Menu.Label>
      <Menu.Item
        color="red"
        onClick={(e: any) => {
          removeItem(name);
          showNotification({
            autoClose: 5000,
            title: (
              <Text>
                Service <b>{name}</b> removed successfully
              </Text>
            ),
            color: 'green',
            icon: <Check />,
            message: undefined,
          });
        }}
        icon={<Trash size={14} />}
      >
        Delete
      </Menu.Item>
    </Menu>
  );
}
