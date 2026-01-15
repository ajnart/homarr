import { Anchor, Card, Stack, Text } from "@mantine/core";

import type { TablerIcon } from "@homarr/ui";

interface NoResultsProps {
  icon: TablerIcon;
  title: string;
  action?: {
    label: string;
    href: string;
    hidden?: boolean;
  };
}

export const NoResults = ({ icon: Icon, title, action }: NoResultsProps) => {
  return (
    <Card withBorder bg="transparent">
      <Stack align="center" gap="sm">
        <Icon size="2rem" />
        <Text fw={500} size="lg">
          {title}
        </Text>
        {!action?.hidden && <Anchor href={action?.href}>{action?.label}</Anchor>}
      </Stack>
    </Card>
  );
};
