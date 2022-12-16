import { Drawer, Title } from '@mantine/core';
import { DashboardSidebar } from '../../Wrappers/Sidebar/Sidebar';

interface MobileRibbonSidebarDrawerProps {
  onClose: () => void;
  opened: boolean;
  location: 'left' | 'right';
}

export const MobileRibbonSidebarDrawer = ({
  location,
  ...props
}: MobileRibbonSidebarDrawerProps) => {
  return (
    <Drawer
      position={location}
      title={<Title order={4}>{location} sidebar</Title>}
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
      {...props}
    >
      <DashboardSidebar location={location} />
    </Drawer>
  );
};
