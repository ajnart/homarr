import { openContextModalGeneric } from '../../../../tools/mantineModalManagerExtensions';
import { ServiceType } from '../../../../types/service';
import { GenericTileMenu } from '../GenericTileMenu';

interface TileMenuProps {
  service: ServiceType;
}

export const ServiceMenu = ({ service }: TileMenuProps) => {
  const handleClickEdit = () => {
    openContextModalGeneric<{ service: ServiceType; allowServiceNamePropagation: boolean }>({
      modal: 'editService',
      size: 'xl',
      innerProps: {
        service,
        allowServiceNamePropagation: false,
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
      modal: 'changeServicePositionModal',
      innerProps: {
        service,
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
