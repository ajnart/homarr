import { openRemoveItemModal, useItemActions } from '~/components/Board/Items/item-actions';
import { type AppItem, useRequiredBoard } from '~/components/Board/context';
import { useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import { CommonItemMenu } from '../CommonItemMenu';
import { EditAppModalInnerProps } from './EditAppModal';

interface AppMenuProps {
  app: AppItem;
}

export const AppMenu = ({ app }: AppMenuProps) => {
  const board = useRequiredBoard();
  const { removeItem } = useItemActions({ boardName: board.name });
  const resizeGridItem = useResizeGridItem();

  const handleClickEdit = () => {
    openContextModalGeneric<EditAppModalInnerProps>({
      modal: 'editApp',
      size: 'xl',
      innerProps: {
        app,
        board,
        allowAppNamePropagation: false,
      },
      styles: {
        root: {
          zIndex: 201,
        },
      },
    });
  };

  const handleClickChangePosition = () => {
    openContextModalGeneric({
      modal: 'changeAppPositionModal',
      innerProps: {
        app,
        boardName: board.name,
        resizeGridItem,
      },
      styles: {
        root: {
          zIndex: 201,
        },
      },
    });
  };

  const handleClickDelete = () => {
    openRemoveItemModal({
      name: app.name,
      onConfirm() {
        removeItem({
          itemId: app.id,
        });
      },
    });
  };

  return (
    <CommonItemMenu
      handleClickEdit={handleClickEdit}
      handleClickChangePosition={handleClickChangePosition}
      handleClickDelete={handleClickDelete}
      displayEdit
    />
  );
};
