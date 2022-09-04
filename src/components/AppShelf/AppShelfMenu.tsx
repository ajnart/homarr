import { ActionIcon, Menu, Modal, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useState } from 'react';
import { IconCheck as Check, IconEdit as Edit, IconMenu, IconTrash as Trash } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useConfig } from '../../tools/state';
import { serviceItem } from '../../tools/types';
import { AddAppShelfItemForm } from './AddAppShelfItem';
import { useColorTheme } from '../../tools/color';

export default function AppShelfMenu(props: any) {
  const { service }: { service: serviceItem } = props;
  const { config, setConfig } = useConfig();
  const { secondaryColor } = useColorTheme();
  const { t } = useTranslation('layout/app-shelf-menu');
  const [opened, setOpened] = useState(false);
  return (
    <>
      <Modal
        size="xl"
        radius="md"
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
        title={t('modal.title')}
      >
        <AddAppShelfItemForm
          config={config}
          setConfig={setConfig}
          setOpened={setOpened}
          {...service}
          message={t('modal.buttons.save')}
        />
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
          <Menu.Label>{t('menu.labels.settings')}</Menu.Label>
          <Menu.Item color={secondaryColor} icon={<Edit />} onClick={() => setOpened(true)}>
            {t('menu.actions.edit')}
          </Menu.Item>
          <Menu.Label>{t('menu.labels.dangerZone')}</Menu.Label>
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
            {t('menu.actions.delete')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
