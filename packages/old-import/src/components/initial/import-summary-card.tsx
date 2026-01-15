import { Button, Card, Group, Stack, Text } from "@mantine/core";

import { objectEntries } from "@homarr/common";
import type { MaybePromise } from "@homarr/common/types";
import { useScopedI18n } from "@homarr/translation/client";

interface ImportSummaryCardProps {
  counts: { apps: number; boards: number; integrations: number; credentialUsers: number };
  loading: boolean;
  onSubmit: () => MaybePromise<void>;
}

export const ImportSummaryCard = ({ counts, onSubmit, loading }: ImportSummaryCardProps) => {
  const tSummary = useScopedI18n("init.step.import.summary");
  return (
    <Card w={64 * 12 + 8} maw="90vw">
      <Stack gap="sm">
        <Stack gap={0}>
          <Text fw={500}>{tSummary("title")}</Text>
          <Text size="sm" c="gray.6">
            {tSummary("description")}
          </Text>
        </Stack>

        <Stack gap="xs">
          {objectEntries(counts).map(([key, count]) => (
            <Card key={key} withBorder p="sm">
              <Group justify="space-between" align="center">
                <Text fw={500} size="sm">
                  {tSummary(`entities.${key}`)}
                </Text>
                <Text size="sm">{count}</Text>
              </Group>
            </Card>
          ))}
        </Stack>

        <Button onClick={onSubmit} loading={loading}>
          {tSummary("action.import")}
        </Button>
      </Stack>
    </Card>
  );
};
