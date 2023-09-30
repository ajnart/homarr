import { MobileRibbons } from './Mobile/Ribbon/MobileRibbon';
import { BoardView } from './Views/DashboardView';
import { DashboardDetailView } from './Views/DetailView';
import { DashboardEditView } from './Views/EditView';
import { useEditModeStore } from './Views/useEditModeStore';

export const Board = () => {
  const isEditMode = useEditModeStore((x) => x.enabled);

  return (
    <>
      {/* The following elemens are splitted because gridstack doesn't reinitialize them when using same item. */}
      <BoardView key={isEditMode.toString()} />
      <MobileRibbons />
    </>
  );
};
