import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconAxe } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import DockerMenuButton from '../../../../../modules/docker/DockerModule';

export const ToolsMenu = () => {
  const { t } = useTranslation('layout/tools');
  return (
    <Menu>
      <Menu.Target>
        <ActionIcon variant="default" radius="md" size="xl" color="blue">
          <IconAxe />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {/* TODO: Implement check to display fallback when no tools */}
        <DockerMenuButton />
        <Menu.Item closeMenuOnClick={false} disabled>
          <Text size="sm" color="dimmed">
            {t('fallback.title')}
          </Text>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
