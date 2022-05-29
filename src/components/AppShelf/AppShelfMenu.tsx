import { Menu, Modal, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { Check, Edit, Trash } from 'tabler-icons-react';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import { AddAppShelfItemForm } from './AddAppShelfItem';

export default function AppShelfMenu(props: any) {
  const { service }: { service: serviceItem } = props;
  const { config, setConfig } = useConfig();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
        title="Modify a service"
      >
        <AddAppShelfItemForm
          setOpened={setOpened}
          name={service.name}
          id={service.id}
          category={service.category}
          type={service.type}
          url={service.url}
          icon={service.icon}
          apiKey={service.apiKey}
          username={service.username}
          password={service.password}
          message="Save service"
        />
      </Modal>
      <Menu
        position="right"
        radius="md"
        shadow="xl"
        styles={{
          body: {
            // Add shadow and elevation to the body
            boxShadow: '0 0 14px 14px rgba(0, 0, 0, 0.1), 0 14px 11px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Menu.Label>Settings</Menu.Label>
        <Menu.Item
          color="primary"
          icon={<Edit />}
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
              services: config.services.filter((s) => s.id !== service.id),
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
          icon={<Trash />}
        >
          Delete
        </Menu.Item>
      </Menu>
    </>
  );
}
