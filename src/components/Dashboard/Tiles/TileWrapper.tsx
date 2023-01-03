/* eslint-disable react/no-unknown-property */
import { ReactNode, RefObject } from 'react';

interface GridstackTileWrapperProps {
  id: string;
  type: 'app' | 'widget';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  itemRef: RefObject<HTMLDivElement>;
  children: ReactNode;
}

export const GridstackTileWrapper = ({
  id,
  type,
  x,
  y,
  width,
  height,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  children,
  itemRef,
}: GridstackTileWrapperProps) => (
  <div
    className="grid-stack-item"
    data-type={type}
    data-id={id}
    gs-x={x}
    data-gridstack-x={x}
    gs-y={y}
    data-gridstack-y={y}
    gs-w={width}
    data-gridstack-w={width}
    gs-h={height}
    data-gridstack-h={height}
    gs-min-w={minWidth}
    gs-min-h={minHeight}
    gs-max-w={maxWidth}
    gs-max-h={maxHeight}
    ref={itemRef}
  >
    {children}
  </div>
);
