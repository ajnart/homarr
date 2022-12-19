import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { IWidget } from '../../../../widgets/widgets';
import { GenericTileMenu } from '../GenericTileMenu';
import { WidgetEditModalInnerProps } from './WidgetsEditModal';
import { WidgetsRemoveModalInnerProps } from './WidgetsRemoveModal';

export type WidgetChangePositionModalInnerProps = {
  integration: string;
  widget: IWidget<string, any>;
};

interface WidgetsMenuProps {
  integration: string;
  widget: IWidget<string, any> | undefined;
}

export const WidgetsMenu = ({ integration, widget }: WidgetsMenuProps) => {
  const { t } = useTranslation(`modules/${integration}`);

  if (!widget) return null;

  const handleDeleteClick = () => {
    openContextModalGeneric<WidgetsRemoveModalInnerProps>({
      modal: 'integrationRemove',
      title: <Title order={4}>{t('descriptor.remove.title')}</Title>,
      innerProps: {
        integration,
      },
    });
  };

  const handleChangeSizeClick = () => {
    openContextModalGeneric<WidgetChangePositionModalInnerProps>({
      modal: 'changeIntegrationPositionModal',
      size: 'xl',
      title: null,
      innerProps: {
        integration,
        widget: widget,
      },
    });
  };

  const handleEditClick = () => {
    openContextModalGeneric<WidgetEditModalInnerProps>({
      modal: 'integrationOptions',
      title: <Title order={4}>{t('descriptor.settings.title')}</Title>,
      innerProps: {
        integration,
        options: widget.properties,
      },
    });
  };

  return (
    <GenericTileMenu
      handleClickEdit={handleEditClick}
      handleClickChangePosition={handleChangeSizeClick}
      handleClickDelete={handleDeleteClick}
      displayEdit={widget.properties !== undefined}
    />
  );
};
