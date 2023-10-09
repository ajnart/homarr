import { Drawer, Title } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { SidebarSection } from '~/components/Board/context';

import { DashboardSidebar } from '../SidebarSection';

interface MobileRibbonSidebarDrawerProps {
  onClose: () => void;
  opened: boolean;
  section: SidebarSection;
}

export const MobileRibbonSidebarDrawer = ({
  section,
  ...props
}: MobileRibbonSidebarDrawerProps) => {
  const { t } = useTranslation('layout/mobile/drawer');
  return (
    <Drawer
      padding={10}
      position={section.position}
      title={<Title order={4}>{t('title', { position: section.position })}</Title>}
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
      styles={{
        title: {
          width: '100%',
        },
      }}
      transitionProps={{ transition: `slide-${section.position === 'right' ? 'left' : 'right'}` }}
      {...props}
    >
      <DashboardSidebar section={section} />
    </Drawer>
  );
};
