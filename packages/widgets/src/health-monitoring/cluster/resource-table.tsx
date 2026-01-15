import { Group, Indicator, Popover, Table, TableTbody, TableThead, TableTr, Text } from "@mantine/core";

import type { Resource } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import { ResourcePopover } from "./resource-popover";

interface ResourceTableProps {
  type: Resource["type"];
  data: Resource[];
  isTiny: boolean;
}

export const ResourceTable = ({ type, data, isTiny }: ResourceTableProps) => {
  const t = useI18n();
  return (
    <Table highlightOnHover>
      <TableThead>
        <TableTr fz={isTiny ? "8px" : "xs"}>
          <Table.Th ta="start" p={0}>
            {t("widget.healthMonitoring.cluster.table.header.name")}
          </Table.Th>
          {type !== "storage" ? (
            <Table.Th ta="start" p={0}>
              {t("widget.healthMonitoring.cluster.table.header.cpu")}
            </Table.Th>
          ) : null}
          {type !== "storage" ? (
            <Table.Th ta="start" p={0}>
              {t("widget.healthMonitoring.cluster.table.header.memory")}
            </Table.Th>
          ) : null}
          {type === "storage" ? (
            <Table.Th ta="start" p={0}>
              {t("widget.healthMonitoring.cluster.table.header.node")}
            </Table.Th>
          ) : null}
        </TableTr>
      </TableThead>
      <TableTbody>
        {data
          .sort((itemA, itemB) => {
            const nodeResult = itemA.node.localeCompare(itemB.node);
            if (nodeResult !== 0) return nodeResult;
            return itemA.name.localeCompare(itemB.name);
          })
          .map((item) => {
            return (
              <ResourcePopover key={item.id} item={item}>
                <Popover.Target>
                  <TableTr fz={isTiny ? "8px" : "xs"}>
                    <td>
                      <Group wrap="nowrap" gap={isTiny ? 8 : "xs"}>
                        <Indicator size={isTiny ? 4 : 8} children={null} color={item.isRunning ? "green" : "yellow"} />
                        <Text lineClamp={1} fz={isTiny ? "8px" : "xs"}>
                          {item.name}
                        </Text>
                      </Group>
                    </td>
                    {item.type === "storage" ? (
                      <td style={{ WebkitLineClamp: "1" }}>{item.node}</td>
                    ) : (
                      <>
                        <td style={{ whiteSpace: "nowrap" }}>{(item.cpu.utilization * 100).toFixed(1)}%</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {(item.memory.total ? (item.memory.used / item.memory.total) * 100 : 0).toFixed(1)}%
                        </td>
                      </>
                    )}
                  </TableTr>
                </Popover.Target>
              </ResourcePopover>
            );
          })}
      </TableTbody>
    </Table>
  );
};
