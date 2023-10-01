import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { WidgetItem, useRequiredBoard } from '~/components/Board/context';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import WidgetsDefinitions from '../../../../widgets';
import { useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { GenericTileMenu } from '../GenericTileMenu';
import { WidgetEditModalInnerProps } from './WidgetsEditModal';
import { WidgetsRemoveModalInnerProps } from './WidgetsRemoveModal';

export type WidgetChangePositionModalInnerProps = {
  widget: WidgetItem;
  wrapperColumnCount: number;
};

interface WidgetsMenuProps {
  type: string;
  widget: WidgetItem | undefined;
}

export const WidgetsMenu = ({ type, widget }: WidgetsMenuProps) => {
  const { t } = useTranslation(`modules/${type}`);
  const board = useRequiredBoard();
  const wrapperColumnCount = useWrapperColumnCount();

  if (!widget || !wrapperColumnCount) return null;
  // Then get the widget definition
  const widgetDefinitionObject = WidgetsDefinitions[widget.sort as keyof typeof WidgetsDefinitions];

  const handleDeleteClick = () => {
    openContextModalGeneric<WidgetsRemoveModalInnerProps>({
      modal: 'integrationRemove',
      title: <Title order={4}>{t('common:remove')}</Title>,
      innerProps: {
        widgetId: widget.id,
        widgetType: type,
      },
    });
  };

  const handleChangeSizeClick = () => {
    openContextModalGeneric<WidgetChangePositionModalInnerProps>({
      modal: 'changeIntegrationPositionModal',
      size: 'xl',
      title: null,
      innerProps: {
        widget,
        wrapperColumnCount,
      },
    });
  };

  const handleEditClick = () => {
    openContextModalGeneric<WidgetEditModalInnerProps>({
      modal: 'integrationOptions',
      title: <Title order={4}>{t('descriptor.settings.title')}</Title>,
      innerProps: {
        widgetId: widget.id,
        widgetType: type,
        options: widget.options,
        boardName: board.name,
        widgetOptions: widgetDefinitionObject.options,
      },
      zIndex: 250,
    });
  };

  return (
    <GenericTileMenu
      handleClickEdit={handleEditClick}
      handleClickChangePosition={handleChangeSizeClick}
      handleClickDelete={handleDeleteClick}
      displayEdit={
        typeof widget.options !== 'undefined' &&
        Object.keys(widgetDefinitionObject?.options ?? {}).length !== 0
      }
    />
  );
};
