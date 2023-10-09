import { Card } from '@mantine/core';
import { RefObject } from 'react';
import { SidebarSection } from '~/components/Board/context';

import { useCardStyles } from '../../../layout/Common/useCardStyles';
import { useGridstack } from '../../gridstack/use-gridstack';
import { SectionContent } from '../SectionContent';

interface DashboardSidebarProps extends DashboardSidebarInnerProps {
  section: SidebarSection;
}
// TODO: Move mobile ribons in this directory too!
export const DashboardSidebar = ({ section }: DashboardSidebarProps) => {
  const {
    classes: { card: cardClass },
  } = useCardStyles(true);
  const { refs } = useGridstack({ section });

  const minRow = useMinRowForFullHeight(refs.wrapper);

  return (
    <Card p={0} m={0} radius="lg" className={cardClass} withBorder>
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
        gs-min-row={minRow}
      >
        <SectionContent items={section.items} refs={refs} />
      </div>{' '}
    </Card>
  );
};

interface DashboardSidebarInnerProps {
  section: SidebarSection;
}

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) =>
  wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 128) : 2;
