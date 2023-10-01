import { Card } from '@mantine/core';
import { RefObject } from 'react';
import { SidebarSection } from '~/components/Board/context';

import { useCardStyles } from '../../../layout/Common/useCardStyles';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';

interface DashboardSidebarProps extends DashboardSidebarInnerProps {
  section: SidebarSection;
  isGridstackReady: boolean;
}

export const DashboardSidebar = ({ section, isGridstackReady }: DashboardSidebarProps) => {
  const {
    cx,
    classes: { card: cardClass },
  } = useCardStyles(true);

  return (
    <Card p={0} m={0} radius="lg" className={cardClass} withBorder>
      {isGridstackReady && <SidebarInner section={section} />}
    </Card>
  );
};

interface DashboardSidebarInnerProps {
  section: SidebarSection;
}

// Is Required because of the gridstack main area width.
const SidebarInner = ({ section }: DashboardSidebarInnerProps) => {
  const { refs } = useGridstack({ section });

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
      data-sidebar={section.id}
      // eslint-disable-next-line react/no-unknown-property
      gs-min-row={minRow}
    >
      <WrapperContent items={section.items} refs={refs} />
    </div>
  );
};

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) =>
  wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 128) : 2;
