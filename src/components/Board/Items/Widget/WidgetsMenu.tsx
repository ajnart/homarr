import { Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { openRemoveItemModal, useItemActions } from '~/components/Board/Items/item-actions';
import { type WidgetItem } from '~/components/Board/context';
import { useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import WidgetsDefinitions from '../../../../widgets';
import { useWrapperColumnCount } from '../../gridstack/store';
import { CommonItemMenu } from '../CommonItemMenu';
import { type WidgetChangePositionModalInnerProps } from './ChangeWidgetPositionModal';
import { type WidgetEditModalInnerProps } from './WidgetsEditModal';

interface WidgetsMenuProps {
  widget: WidgetItem;
}

export const WidgetsMenu = ({ widget }: WidgetsMenuProps) => {
  const { t } = useTranslation(`modules/${widget.type}`);
  const wrapperColumnCount = useWrapperColumnCount();
  const resizeGridItem = useResizeGridItem();
  const { removeItem } = useItemActions();

  if (!widget || !wrapperColumnCount) return null;
  // Then get the widget definition
  const widgetDefinitionObject = WidgetsDefinitions[widget.type as keyof typeof WidgetsDefinitions];

  const handleDeleteClick = () => {
    openRemoveItemModal({
      name: widget.type,
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
        widgetType: widget.type,
        options: widget.options,
        widgetOptions: widgetDefinitionObject.options,
      },
      zIndex: 250,
    });
  };

  return (
    <CommonItemMenu
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
