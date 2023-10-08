import { MobileRibbons } from './Mobile/Ribbon/MobileRibbon';
import { BoardView } from './Views/DashboardView';

export const Board = () => {
  return (
    <>
      {/* The following elemens are splitted because gridstack doesn't reinitialize them when using same item. */}
      <BoardView />
      <MobileRibbons />
    </>
  );
};
