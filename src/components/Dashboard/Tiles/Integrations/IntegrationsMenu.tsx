import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { IntegrationsType } from '../../../../types/integration';
import { TileBaseType } from '../../../../types/tile';
import { GenericTileMenu } from '../GenericTileMenu';
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
      modal: 'changeIntegrationPositionModal',
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
    <GenericTileMenu
      handleClickEdit={handleEditClick}
      handleClickChangePosition={handleChangeSizeClick}
      handleClickDelete={handleDeleteClick}
      displayEdit={options !== undefined}
    />
  );
};
