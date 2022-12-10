import { ActionIcon, Menu, Title } from '@mantine/core';
import { IconDots, IconLayoutKanban, IconPencil, IconTrash } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { IntegrationsType } from '../../../../types/integration';
import { TileBaseType } from '../../../../types/tile';
import { IntegrationChangePositionModalInnerProps } from '../IntegrationChangePositionModal';
import { IntegrationRemoveModalInnerProps } from '../IntegrationRemoveModal';
import {
  IntegrationEditModalInnerProps,
  integrationModuleTranslationsMap,
  IntegrationOptionLabels,
  IntegrationOptions,
} from '../IntegrationsEditModal';

interface IntegrationsMenuProps<TIntegrationKey extends keyof IntegrationsType> {
  integration: TIntegrationKey;
  module: TileBaseType | undefined;
  options: IntegrationOptions<TIntegrationKey> | undefined;
  labels: IntegrationOptionLabels<IntegrationOptions<TIntegrationKey>>;
}

export const IntegrationsMenu = <TIntegrationKey extends keyof IntegrationsType>({
  integration,
  options,
  labels,
  module,
}: IntegrationsMenuProps<TIntegrationKey>) => {
  const { t } = useTranslation(integrationModuleTranslationsMap.get(integration));

  if (!module) return null;

  const handleDeleteClick = () => {
    openContextModalGeneric<IntegrationRemoveModalInnerProps>({
      modal: 'integrationRemove',
      title: <Title order={4}>{t('descriptor.remove.title')}</Title>,
      innerProps: {
        integration,
      },
    });
  };

  const handleChangeSizeClick = () => {
    openContextModalGeneric<IntegrationChangePositionModalInnerProps>({
      modal: 'integrationChangePosition',
      size: 'xl',
      title: null,
      innerProps: {
        integration,
        module,
      },
    });
  };

  const handleEditClick = () => {
    openContextModalGeneric<IntegrationEditModalInnerProps<TIntegrationKey>>({
      modal: 'integrationOptions',
      title: <Title order={4}>{t('descriptor.settings.title')}</Title>,
      innerProps: {
        integration,
        options,
        labels,
      },
    });
  };

  return (
    <Menu withinPortal>
      <Menu.Target>
        <ActionIcon pos="absolute" top={4} right={4}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown w={250}>
        <Menu.Label>Settings</Menu.Label>
        {options && (
          <Menu.Item icon={<IconPencil size={16} stroke={1.5} />} onClick={handleEditClick}>
            Edit
          </Menu.Item>
        )}
        <Menu.Item
          icon={<IconLayoutKanban size={16} stroke={1.5} />}
          onClick={handleChangeSizeClick}
        >
          Change position
        </Menu.Item>
        <Menu.Label>Danger zone</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IconTrash size={16} stroke={1.5} color="red" />}
          onClick={handleDeleteClick}
        >
          Remove
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
