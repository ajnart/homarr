import { MobileRibbons } from './Mobile/Ribbon/MobileRibbon';
import { DashboardDetailView } from './Views/DetailView';
import { DashboardEditView } from './Views/EditView';
import { useEditModeStore } from './Views/useEditModeStore';

export const Dashboard = () => {
  const isEditMode = useEditModeStore((x) => x.enabled);

  return (
    <>
      {/* The following elemens are splitted because gridstack doesn't reinitialize them when using same item. */}
      {isEditMode ? <DashboardEditView /> : <DashboardDetailView />}
      <MobileRibbons />
    </>
  );
};
