import { Menu, Modal, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { Check, Edit, Trash } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { AddAppShelfItemForm } from './AddAppShelfItem';

export default function AppShelfMenu(props: any) {
  const { service } = props;
  const { config, setConfig } = useConfig();
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="xl"
        radius="lg"
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
        title="Modify a service"
      >
        <AddAppShelfItemForm
          setOpened={setOpened}
          name={service.name}
          type={service.type}
          url={service.url}
          icon={service.icon}
          apiKey={service.apiKey}
          message="Save service"
        />
      </Modal>
      <Menu position="right">
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item
          color="primary"
          icon={<Edit size={14} />}
          // TODO: #2 Add the ability to edit the service.
          onClick={() => setOpened(true)}
        >
          Edit
        </Menu.Item>
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          onClick={(e: any) => {
            setConfig({
              ...config,
              services: config.services.filter((s) => s.name !== service.name),
            });
            showNotification({
              autoClose: 5000,
              title: (
                <Text>
                  Service <b>{service.name}</b> removed successfully
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
    </>
  );
}
