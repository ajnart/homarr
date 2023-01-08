import { Card } from '@mantine/core';
import { RefObject } from 'react';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardSidebarProps extends DashboardSidebarInnerProps {
  location: 'right' | 'left';
  isGridstackReady: boolean;
}

export const DashboardSidebar = ({ location, isGridstackReady }: DashboardSidebarProps) => (
  <Card
    withBorder
    w={300}
    style={{
      background: 'none',
      borderStyle: 'dashed',
    }}
  >
    {isGridstackReady && <SidebarInner location={location} />}
  </Card>
);

interface DashboardSidebarInnerProps {
  location: 'right' | 'left';
}

// Is Required because of the gridstack main area width.
const SidebarInner = ({ location }: DashboardSidebarInnerProps) => {
  const { refs, apps, widgets } = useGridstack('sidebar', location);

  const minRow = useMinRowForFullHeight(refs.wrapper);
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(false);

  return (
    <Card withBorder mih="100%" p={0} radius="lg" className={cardClass} ref={refs.wrapper}>
      <div
        className="grid-stack grid-stack-sidebar"
        style={{ transitionDuration: '0s', height: '100%' }}
        data-sidebar={location}
        gs-min-row={minRow}
      >
        <WrapperContent apps={apps} refs={refs} widgets={widgets} />
      </div>
    </Card>
  );
};

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) =>
  wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 128) : 2;
