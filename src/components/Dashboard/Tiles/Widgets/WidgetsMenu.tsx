import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { type WidgetItem, useRequiredBoard } from '~/components/Board/context';
import { useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { openRemoveItemModal, useItemActions } from '~/components/Board/item-actions';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import WidgetsDefinitions from '../../../../widgets';
import { type WidgetChangePositionModalInnerProps } from '../../Modals/ChangePosition/ChangeWidgetPositionModal';
import { useWrapperColumnCount } from '../../Wrappers/gridstack/store';
import { GenericTileMenu } from '../GenericTileMenu';
import { type WidgetEditModalInnerProps } from './WidgetsEditModal';

interface WidgetsMenuProps {
  type: string;
  widget: WidgetItem | undefined;
}

export const WidgetsMenu = ({ type, widget }: WidgetsMenuProps) => {
  const { t } = useTranslation(`modules/${type}`);
  const board = useRequiredBoard();
  const wrapperColumnCount = useWrapperColumnCount();
  const resizeGridItem = useResizeGridItem();
  const { removeItem } = useItemActions({ boardName: board.name });

  if (!widget || !wrapperColumnCount) return null;
  // Then get the widget definition
  const widgetDefinitionObject = WidgetsDefinitions[widget.sort as keyof typeof WidgetsDefinitions];

  const handleDeleteClick = () => {
    openRemoveItemModal({
      name: widget.sort,
      onConfirm() {
        removeItem({
          itemId: widget.id,
        });
      },
    });
  };

  const handleChangeSizeClick = () => {
    openContextModalGeneric<WidgetChangePositionModalInnerProps>({
      modal: 'changeWidgetPositionModal',
      size: 'xl',
      title: null,
      innerProps: {
        widget,
        boardName: board.name,
        wrapperColumnCount,
        resizeGridItem,
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
