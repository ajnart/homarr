import { Center, Group, ScrollArea, Table, TableTd, TableTh, TableTr, Text, Title, Tooltip } from "@mantine/core";
import { IconHeartbeat, IconTransform } from "@tabler/icons-react";

import { humanFileSize } from "@homarr/common";
import type { TdarrQueue } from "@homarr/integrations";
import { useI18n } from "@homarr/translation/client";

interface QueuePanelProps {
  queue: TdarrQueue;
}

export function QueuePanel(props: QueuePanelProps) {
  const { queue } = props;

  const t = useI18n("widget.mediaTranscoding.panel.queue");

  if (queue.array.length === 0) {
    return (
      <Center style={{ flex: "1" }}>
        <Title order={6}>{t("empty")}</Title>
      </Center>
    );
  }

  return (
    <ScrollArea style={{ flex: "1" }}>
      <Table style={{ tableLayout: "fixed" }}>
        <Table.Thead>
          <TableTr>
            <TableTh ta="start" py={4}>
              <Text size="xs" fw="bold">
                {t("table.file")}
              </Text>
            </TableTh>
            <TableTh ta="start" py={4}>
              <Text size="xs" fw="bold">
                {t("table.size")}
              </Text>
            </TableTh>
          </TableTr>
        </Table.Thead>
        <Table.Tbody>
          {queue.array.map((item) => (
            <TableTr key={item.id}>
              <TableTd py={2}>
                <Group gap={4} wrap="nowrap">
                  {item.type === "transcode" ? (
                    <Tooltip label={t("table.transcode")}>
                      <IconTransform size={12} />
                    </Tooltip>
                  ) : (
                    <Tooltip label={t("table.healthCheck")}>
                      <IconHeartbeat size={12} />
                    </Tooltip>
                  )}
                  <Text lineClamp={1} size="xs">
                    {item.filePath.split("\\").pop()?.split("/").pop() ?? item.filePath}
                  </Text>
                </Group>
              </TableTd>
              <TableTd py={2}>
                <Text size="xs">{humanFileSize(item.fileSize)}</Text>
              </TableTd>
            </TableTr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
