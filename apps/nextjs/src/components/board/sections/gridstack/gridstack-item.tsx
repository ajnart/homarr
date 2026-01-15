import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import type { BoxProps } from "@mantine/core";
import { Box } from "@mantine/core";
import combineClasses from "clsx";

import type { SectionKind, WidgetKind } from "@homarr/definitions";
import type { GridItemHTMLElement } from "@homarr/gridstack";

interface Props extends BoxProps {
  id: string;
  type: "item" | "section";
  kind: WidgetKind | SectionKind;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  innerRef: React.RefObject<GridItemHTMLElement | null> | undefined;
}

export const GridStackItem = ({
  id,
  type,
  kind,
  xOffset,
  yOffset,
  width,
  height,
  minWidth = 1,
  minHeight = 1,
  innerRef,
  children,
  ...boxProps
}: PropsWithChildren<Props>) => {
  useEffect(() => {
    if (!innerRef?.current?.gridstackNode) return;
    if (type !== "section") return;
    innerRef.current.gridstackNode.minW = minWidth;
    innerRef.current.gridstackNode.minH = minHeight;
  }, [minWidth, minHeight, innerRef, type]);

  return (
    <Box
      {...boxProps}
      className={combineClasses("grid-stack-item", boxProps.className)}
      data-id={id}
      data-type={type}
      data-kind={kind}
      gs-x={xOffset}
      gs-y={yOffset}
      gs-w={width}
      gs-h={height}
      gs-min-w={minWidth}
      gs-min-h={minHeight}
      ref={innerRef as React.RefObject<HTMLDivElement>}
    >
      {children}
    </Box>
  );
};
