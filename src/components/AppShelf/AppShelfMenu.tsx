import { ActionIcon, Menu, Modal, Text, useMantineTheme } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { IconCheck as Check, IconEdit as Edit, IconMenu, IconTrash as Trash } from '@tabler/icons';
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
        <AddAppShelfItemForm setOpened={setOpened} {...service} message="Save service" />
      </Modal>
      <Menu
        withinPortal
        width={150}
        shadow="xl"
        withArrow
        radius="md"
        position="right"
        styles={{
          dropdown: {
            // Add shadow and elevation to the body
            boxShadow: '0 0 14px 14px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        <Menu.Target>
          <ActionIcon style={{}}>
            <IconMenu />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Settings</Menu.Label>
          <Menu.Item color={secondaryColor} icon={<Edit />} onClick={() => setOpened(true)}>
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
                    Service <b>{service.name}</b> removed successfully!
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
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
