import { Badge, Box, Card } from "@mantine/core";
import combineClasses from "clsx";

import { useCurrentLayout, useRequiredBoard } from "@homarr/boards/context";

import type { DynamicSectionItem } from "~/app/[locale]/boards/_types";
import { BoardDynamicSectionMenu } from "./dynamic/dynamic-menu";
import { GridStack } from "./gridstack/gridstack";
import classes from "./item.module.css";

interface Props {
  section: DynamicSectionItem;
}

export const BoardDynamicSection = ({ section }: Props) => {
  const board = useRequiredBoard();
  const currentLayoutId = useCurrentLayout();
  const options = section.options;

  return (
    <Box
      className="grid-stack-item-content"
      style={{
        overflow: "visible",
      }}
    >
      <Card
        className={combineClasses(classes.itemCard, section.options.customCssClasses.join(" "))}
        w="100%"
        h="100%"
        withBorder
        styles={{
          root: {
            overflow: "visible",
            "--opacity": board.opacity / 100,
            "--border-color": options.borderColor || undefined,
          },
        }}
        radius={board.itemRadius}
        p={0}
      >
        {options.title && (
          <Badge
            pos="absolute"
            top={-15}
            left={10}
            size="md"
            radius={board.itemRadius}
            color="var(--background-color)"
            c="var(--mantine-color-text)"
            bd="1px solid var(--border-color)"
          >
            {options.title}
          </Badge>
        )}
        {/* Use unique key by layout to reinitialize gridstack */}
        <GridStack key={`${currentLayoutId}-${section.id}`} section={section} className="min-row" />
      </Card>
      <BoardDynamicSectionMenu section={section} />
    </Box>
  );
};
