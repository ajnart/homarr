import type { PropsWithChildren } from "react";
import type { MantineColor } from "@mantine/core";
import { Accordion, Badge, Group, Text } from "@mantine/core";

import type { TablerIcon } from "@homarr/ui";

interface ResourceAccordionItemProps {
  value: string;
  title: string;
  icon: TablerIcon;
  badge: {
    color: MantineColor;
    activeCount: number;
    totalCount: number;
  };
  isTiny: boolean;
}

export const ResourceAccordionItem = ({
  value,
  title,
  icon: Icon,
  badge,
  children,
  isTiny,
}: PropsWithChildren<ResourceAccordionItemProps>) => {
  return (
    <Accordion.Item value={value}>
      <Accordion.Control icon={isTiny ? null : <Icon size={16} />}>
        <Group style={{ rowGap: "0" }} gap="xs">
          <Text size="xs">{title}</Text>
          <Badge variant="dot" color={badge.color} size="xs">
            {badge.activeCount} / {badge.totalCount}
          </Badge>
        </Group>
      </Accordion.Control>
      <Accordion.Panel>{children}</Accordion.Panel>
    </Accordion.Item>
  );
};
