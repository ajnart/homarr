import { type AppItem, useRequiredBoard } from '~/components/Board/context';
import { useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { openRemoveItemModal, useItemActions } from '~/components/Board/item-actions';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import { GenericTileMenu } from '../GenericTileMenu';

interface TileMenuProps {
  app: AppItem;
}

export const AppMenu = ({ app }: TileMenuProps) => {
  const board = useRequiredBoard();
  const { removeItem } = useItemActions({ boardName: board.name });
  const resizeGridItem = useResizeGridItem();

  const handleClickEdit = () => {
    openContextModalGeneric<{ app: AppItem; allowAppNamePropagation: boolean }>({
      modal: 'editApp',
      size: 'xl',
      innerProps: {
        app,
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
    <GenericTileMenu
      handleClickEdit={handleClickEdit}
      handleClickChangePosition={handleClickChangePosition}
      handleClickDelete={handleClickDelete}
      displayEdit
    />
  );
};
