import { ActionIcon, Menu, Text } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { IconCheck, IconEdit, IconMenu, IconTrash } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';
import { useColorTheme } from '../../../tools/color';
import { ServiceType } from '../../../types/service';

interface TileMenuProps {
  service: ServiceType;
}

export const TileMenu = ({ service }: TileMenuProps) => {
  const { secondaryColor } = useColorTheme();
  const { t } = useTranslation('layout/app-shelf-menu');
  const updateConfig = useConfigStore((x) => x.updateConfig);
  const { name: configName } = useConfigContext();

  return (
    <Menu withinPortal width={150} shadow="xl" withArrow radius="md" position="right">
      <Menu.Target>
        <ActionIcon>
          <IconMenu />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t('menu.labels.settings')}</Menu.Label>
        <Menu.Item
          color={secondaryColor}
          icon={<IconEdit />}
          onClick={() =>
            openContextModal({
              modal: 'changeTilePosition',
              innerProps: {
                type: 'service',
                tile: service,
              },
            })
          }
        >
          {t('menu.actions.edit')}
        </Menu.Item>
        <Menu.Label>{t('menu.labels.dangerZone')}</Menu.Label>
        <Menu.Item
          color="red"
          onClick={(e: any) => {
            if (!configName) {
              return;
            }
            updateConfig(configName, (previousConfig) => ({
              ...previousConfig,
              services: previousConfig.services.filter((x) => x.id !== service.id),
            })).then(() => {
              showNotification({
                autoClose: 5000,
                title: (
                  <Text>
                    Service <b>{service.name}</b> removed successfully!
                  </Text>
                ),
                color: 'green',
                icon: <IconCheck />,
                message: undefined,
              });
            });
          }}
          icon={<IconTrash />}
        >
          {t('menu.actions.delete')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
