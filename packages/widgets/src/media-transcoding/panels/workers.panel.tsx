import {
  Center,
  Group,
  Progress,
  ScrollArea,
  Table,
  TableTd,
  TableTh,
  TableTr,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconHeartbeat, IconTransform } from "@tabler/icons-react";

import type { TdarrWorker } from "@homarr/integrations";
import { useI18n } from "@homarr/translation/client";

interface WorkersPanelProps {
  workers: TdarrWorker[];
  isTiny: boolean;
}

export function WorkersPanel(props: WorkersPanelProps) {
  const t = useI18n("widget.mediaTranscoding.panel.workers");

  if (props.workers.length === 0) {
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
            <TableTh ta="start" py={4} w={50}>
              <Text size="xs" fw="bold">
                {t("table.eta")}
              </Text>
            </TableTh>
            <TableTh ta="start" py={4}>
              <Text size="xs" fw="bold">
                {t("table.progress")}
              </Text>
            </TableTh>
          </TableTr>
        </Table.Thead>
        <Table.Tbody>
          {props.workers.map((worker) => {
            const fileName = worker.filePath.split("\\").pop()?.split("/").pop() ?? worker.filePath;
            return (
              <TableTr key={worker.id}>
                <TableTd py={2}>
                  <Group gap="xs" wrap="nowrap">
                    <div>
                      {worker.jobType === "transcode" ? (
                        <Tooltip label={t("table.transcode")}>
                          <IconTransform size={14} />
                        </Tooltip>
                      ) : (
                        <Tooltip label={t("table.healthCheck")}>
                          <IconHeartbeat size={14} />
                        </Tooltip>
                      )}
                    </div>
                    <Text lineClamp={1} size="xs" title={fileName}>
                      {fileName}
                    </Text>
                  </Group>
                </TableTd>
                <TableTd py={2}>
                  <Text size="xs">{worker.ETA.startsWith("0:") ? worker.ETA.substring(2) : worker.ETA}</Text>
                </TableTd>
                <TableTd py={2}>
                  <Group wrap="nowrap" gap="xs">
                    {!props.isTiny && (
                      <>
                        <Text size="xs">{worker.step}</Text>
                        <Progress
                          value={worker.percentage}
                          size="lg"
                          radius="xl"
                          style={{
                            flex: 1,
                          }}
                        />
                      </>
                    )}
                    <Text size="xs">{Math.round(worker.percentage)}%</Text>
                  </Group>
                </TableTd>
              </TableTr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
