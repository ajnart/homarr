import { Card } from '@mantine/core';
import { RefObject } from 'react';
import { useGridstack } from '../gridstack/use-gridstack';
import { WrapperContent } from '../WrapperContent';

interface DashboardSidebarProps {
  location: 'right' | 'left';
}

export const DashboardSidebar = ({ location }: DashboardSidebarProps) => {
  const { refs, apps, widgets } = useGridstack('sidebar', location);

  const minRow = useMinRowForFullHeight(refs.wrapper);

  return (
    <Card
      withBorder
      w={300}
      style={{
        background: 'none',
        borderStyle: 'dashed',
      }}
    >
      <div
        className="grid-stack grid-stack-sidebar"
        style={{ transitionDuration: '0s', height: '100%' }}
        data-sidebar={location}
        // eslint-disable-next-line react/no-unknown-property
        gs-min-row={minRow}
        ref={refs.wrapper}
      >
        <WrapperContent apps={apps} refs={refs} widgets={widgets} />
      </div>
    </Card>
  );
};

const useMinRowForFullHeight = (wrapperRef: RefObject<HTMLDivElement>) =>
  wrapperRef.current ? Math.floor(wrapperRef.current!.offsetHeight / 64) : 2;
