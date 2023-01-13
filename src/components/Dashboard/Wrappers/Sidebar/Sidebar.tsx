import { Card, Group, Stack } from '@mantine/core';
import { RefObject } from 'react';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardSidebarProps extends DashboardSidebarInnerProps {
  location: 'right' | 'left';
  isGridstackReady: boolean;
}

export const DashboardSidebar = ({ location, isGridstackReady }: DashboardSidebarProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(false);

  return (
    <Card
      p={0}
      m={0}
      radius="lg"
      className={cardClass}
      w={300}
    >
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
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(false);

  return (
    <div
      ref={refs.wrapper}
      className="grid-stack grid-stack-sidebar"
      style={{
        transitionDuration: '0s',
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
