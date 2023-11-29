import { openRemoveItemModal, useItemActions } from '~/components/Board/Items/item-actions';
import { type AppItem } from '~/components/Board/context';
import { useResizeGridItem } from '~/components/Board/gridstack/useResizeGridItem';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';

import { CommonItemMenu } from '../CommonItemMenu';
import { EditAppModalInnerProps } from './EditAppModal';

interface AppMenuProps {
  app: AppItem;
}

export const AppMenu = ({ app }: AppMenuProps) => {
  const { removeItem } = useItemActions();
  const resizeGridItem = useResizeGridItem();

  const handleClickEdit = () => {
    openContextModalGeneric<EditAppModalInnerProps>({
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
