import { Card } from '@mantine/core';
import { RefObject } from 'react';

import { useCardStyles } from '../../../layout/Common/useCardStyles';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';

interface DashboardSidebarProps extends DashboardSidebarInnerProps {
  location: 'right' | 'left';
  isGridstackReady: boolean;
}

export const DashboardSidebar = ({ location, isGridstackReady }: DashboardSidebarProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(true);

  return (
    <Card p={0} m={0} radius="lg" className={cardClass} withBorder>
      {isGridstackReady && <SidebarInner location={location} />}
    </Card>
  );
};

interface DashboardSidebarInnerProps {
  location: 'right' | 'left';
}

// Is Required because of the gridstack main area width.
const SidebarInner = ({ location }: DashboardSidebarInnerProps) => {
  const { refs, apps, widgets } = useGridstack('sidebar', location);

  const minRow = useMinRowForFullHeight(refs.wrapper);

  return (
    <div
      ref={refs.wrapper}
      className="grid-stack grid-stack-sidebar"
      style={{
        transitionDuration: '0s',
        minWidth: 256,
        height: '100%',
        width: '100%',
      }}
      data-sidebar={location}
      // eslint-disable-next-line react/no-unknown-property
      gs-min-row={minRow}
    >
      <WrapperContent apps={apps} refs={refs} widgets={widgets} />
    </div>
  );
};

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) =>
  wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 128) : 2;
