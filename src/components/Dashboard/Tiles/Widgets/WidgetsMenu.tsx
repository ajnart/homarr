import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { IWidget } from '../../../../widgets/widgets';
import { GenericTileMenu } from '../GenericTileMenu';
import { WidgetEditModalInnerProps } from './WidgetsEditModal';
import { WidgetsRemoveModalInnerProps } from './WidgetsRemoveModal';
import WidgetsDefinitions from '../../../../widgets';

export type WidgetChangePositionModalInnerProps = {
  widgetId: string;
  widget: IWidget<string, any>;
};

interface WidgetsMenuProps {
  integration: string;
  widget: IWidget<string, any> | undefined;
}

export const WidgetsMenu = ({ integration, widget }: WidgetsMenuProps) => {
  const { t } = useTranslation(`modules/${integration}`);

  if (!widget) return null;
  // Match widget.id with WidgetsDefinitions
  // First get the keys
  const keys = Object.keys(WidgetsDefinitions);
  // Then find the key that matches the widget.id
  const widgetDefinition = keys.find((key) => key === widget.id);
  // Then get the widget definition
  const widgetDefinitionObject =
    WidgetsDefinitions[widgetDefinition as keyof typeof WidgetsDefinitions];

  const handleDeleteClick = () => {
    openContextModalGeneric<WidgetsRemoveModalInnerProps>({
      modal: 'integrationRemove',
      title: <Title order={4}>{t('descriptor.remove.title')}</Title>,
      innerProps: {
        widgetId: integration,
      },
    });
  };

  const handleChangeSizeClick = () => {
    openContextModalGeneric<WidgetChangePositionModalInnerProps>({
      modal: 'changeIntegrationPositionModal',
      size: 'xl',
      title: null,
      innerProps: {
        widgetId: integration,
        widget,
      },
    });
  };

  const handleEditClick = () => {
    openContextModalGeneric<WidgetEditModalInnerProps>({
      modal: 'integrationOptions',
      title: <Title order={4}>{t('descriptor.settings.title')}</Title>,
      innerProps: {
        widgetId: integration,
        options: widget.properties,
        // Cast as the right type for the correct widget
        widgetOptions: widgetDefinitionObject.options as any,
      },
      zIndex: 5,
    });
  };

  return (
    <GenericTileMenu
      handleClickEdit={handleEditClick}
      handleClickChangePosition={handleChangeSizeClick}
      handleClickDelete={handleDeleteClick}
      displayEdit={
        typeof widget.properties !== 'undefined' && Object.keys(widget.properties).length !== 0
      }
    />
  );
};
