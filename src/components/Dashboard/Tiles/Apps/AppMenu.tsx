import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../types/app';
import { GenericTileMenu } from '../GenericTileMenu';

interface TileMenuProps {
  app: AppType;
}

export const AppMenu = ({ app }: TileMenuProps) => {
  const handleClickEdit = () => {
    openContextModalGeneric<{ app: AppType; allowAppNamePropagation: boolean }>({
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
      },
      styles: {
        root: {
          zIndex: 201,
        },
      },
    });
  };

  const handleClickDelete = () => {};

  return (
    <GenericTileMenu
      handleClickEdit={handleClickEdit}
      handleClickChangePosition={handleClickChangePosition}
      handleClickDelete={handleClickDelete}
      displayEdit
    />
  );
};
