import { Drawer, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';

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
  const { t } = useTranslation('layout/mobile/drawer');
  return (
    <Drawer
      padding={10}
      position={location}
      title={<Title order={4}>{t('title', { position: location })}</Title>}
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
      styles={{
        title: {
          width: '100%',
        },
      }}
      transitionProps={{ transition: `slide-${location === 'right' ? 'left' : 'right'}` }}
      {...props}
    >
      <DashboardSidebar location={location} isGridstackReady />
    </Drawer>
  );
};
