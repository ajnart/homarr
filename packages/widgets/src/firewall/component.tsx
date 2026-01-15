"use client";

import { useCallback, useState } from "react";
import { Accordion, Box, Center, Flex, Group, RingProgress, ScrollArea, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { IconArrowBarDown, IconArrowBarUp, IconBrain, IconCpu, IconTopologyBus } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import type { FirewallInterface, FirewallInterfacesSummary } from "@homarr/integrations";
import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";
import { FirewallMenu } from "./firewall-menu";
import { FirewallVersion } from "./firewall-version";

export interface Firewall {
  label: string;
  value: string;
}

export default function FirewallWidget({ integrationIds, width, itemId }: WidgetComponentProps<"firewall">) {
  const [selectedFirewall, setSelectedFirewall] = useState<string>("");

  const handleSelect = useCallback((value: string | null) => {
    if (value !== null) {
      setSelectedFirewall(value);
    } else {
      setSelectedFirewall("default_value");
    }
  }, []);

  const firewallsCpuData = useUpdatingCpuStatus(integrationIds);
  const firewallsMemoryData = useUpdatingMemoryStatus(integrationIds);
  const firewallsVersionData = useUpdatingVersionStatus(integrationIds);
  const firewallsInterfacesData = useUpdatingInterfacesStatus(integrationIds);

  const initialSelectedFirewall = firewallsVersionData[0] ? firewallsVersionData[0].integration.id : "undefined";
  const isTiny = width < 256;

  const [accordionValue, setAccordionValue] = useLocalStorage<string | null>({
    key: `homarr-${itemId}-firewall`,
    defaultValue: "interfaces",
  });

  const dropdownItems = firewallsVersionData.map((firewall) => ({
    label: firewall.integration.name,
    value: firewall.integration.id,
  }));

  const t = useI18n();

  return (
    <ScrollArea h="100%">
      <Group justify="space-between" w="100%" style={{ padding: "8px" }}>
        <FirewallMenu
          onChange={handleSelect}
          selectedFirewall={selectedFirewall || initialSelectedFirewall}
          dropdownItems={dropdownItems}
          isTiny={isTiny}
        />
        <FirewallVersion
          firewallsVersionData={firewallsVersionData}
          selectedFirewall={selectedFirewall || initialSelectedFirewall}
          isTiny={isTiny}
        />
      </Group>
      <Flex justify="center" align="center" wrap="wrap">
        {/* Render CPU and Memory data */}
        {firewallsCpuData
          .filter(({ integration }) => integration.id === (selectedFirewall || initialSelectedFirewall))
          .map(({ summary, integration }) => (
            <RingProgress
              key={`${integration.name}-cpu`}
              roundCaps
              size={isTiny ? 50 : 100}
              thickness={isTiny ? 4 : 8}
              label={
                <Center style={{ flexDirection: "column" }}>
                  <Text size={isTiny ? "8px" : "xs"}>{`${summary.total.toFixed(2)}%`}</Text>
                  <IconCpu size={isTiny ? 8 : 16} />
                </Center>
              }
              sections={[
                {
                  value: Number(summary.total.toFixed(1)),
                  color: summary.total > 50 ? (summary.total < 75 ? "yellow" : "red") : "green",
                },
              ]}
            />
          ))}
        {firewallsMemoryData
          .filter(({ integration }) => integration.id === (selectedFirewall || initialSelectedFirewall))
          .map(({ summary, integration }) => (
            <RingProgress
              key={`${integration.name}-memory`}
              roundCaps
              size={isTiny ? 50 : 100}
              thickness={isTiny ? 4 : 8}
              label={
                <Center style={{ flexDirection: "column" }}>
                  <Text size={isTiny ? "8px" : "xs"}>{`${summary.percent.toFixed(1)}%`}</Text>
                  <IconBrain size={isTiny ? 8 : 16} />
                </Center>
              }
              sections={[
                {
                  value: Number(summary.percent.toFixed(1)),
                  color: summary.percent > 50 ? (summary.percent < 75 ? "yellow" : "red") : "green",
                },
              ]}
            />
          ))}
      </Flex>
      {firewallsInterfacesData
        .filter(({ integration }) => integration.id === (selectedFirewall || initialSelectedFirewall))
        .map(({ summary }) => (
          <Accordion key="interfaces" value={accordionValue} onChange={setAccordionValue}>
            <Accordion.Item value="interfaces">
              <Accordion.Control icon={isTiny ? null : <IconTopologyBus size={16} />}>
                <Text size={isTiny ? "8px" : "xs"}> {t("widget.firewall.widget.interfaces.title")} </Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Flex direction="column" key="interfaces">
                  {Array.isArray(summary) && summary.every((item) => Array.isArray(item.data)) ? (
                    calculateBandwidth(summary).data.map(({ name, receive, transmit }) => (
                      <Flex
                        key={name}
                        direction={isTiny ? "column" : "row"}
                        style={{
                          width: "100%",
                          padding: isTiny ? "2px" : "0px",
                        }}
                      >
                        <Flex w={isTiny ? "100%" : "33%"} style={{ justifyContent: "flex-start" }}>
                          <Text
                            size={isTiny ? "8px" : "xs"}
                            color="lightblue"
                            style={{
                              maxWidth: "100px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                            }}
                          >
                            {name}
                          </Text>
                        </Flex>
                        <Flex
                          align="center"
                          gap="4"
                          w={isTiny ? "100%" : "33%"}
                          style={{ justifyContent: "flex-start" }}
                        >
                          <IconArrowBarUp size={isTiny ? "8" : "12"} color="lightgreen" />
                          <Text size={isTiny ? "8px" : "xs"} color="lightgreen" style={{ textAlign: "left" }}>
                            {formatBitsPerSec(transmit, 2)}
                          </Text>
                        </Flex>
                        <Flex
                          align="center"
                          gap="4"
                          w={isTiny ? "100%" : "33%"}
                          style={{ justifyContent: "flex-start" }}
                        >
                          <IconArrowBarDown size={isTiny ? "8" : "12"} color="yellow" />
                          <Text size={isTiny ? "8px" : "xs"} color="yellow" style={{ textAlign: "left" }}>
                            {formatBitsPerSec(receive, 2)}
                          </Text>
                        </Flex>
                      </Flex>
                    ))
                  ) : (
                    <Box>No data available</Box>
                  )}
                </Flex>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ))}
    </ScrollArea>
  );
}

export const useUpdatingCpuStatus = (integrationIds: string[]) => {
  const utils = clientApi.useUtils();
  const [firewallsCpuData] = clientApi.widget.firewall.getFirewallCpuStatus.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  clientApi.widget.firewall.subscribeFirewallCpuStatus.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.firewall.getFirewallCpuStatus.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }

            return prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
          },
        );
      },
    },
  );

  return firewallsCpuData;
};

export const useUpdatingMemoryStatus = (integrationIds: string[]) => {
  const utils = clientApi.useUtils();
  const [firewallsMemoryData] = clientApi.widget.firewall.getFirewallMemoryStatus.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  clientApi.widget.firewall.subscribeFirewallMemoryStatus.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.firewall.getFirewallMemoryStatus.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }

            return prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
          },
        );
      },
    },
  );

  return firewallsMemoryData;
};

export const useUpdatingVersionStatus = (integrationIds: string[]) => {
  const utils = clientApi.useUtils();
  const [firewallsVersionData] = clientApi.widget.firewall.getFirewallVersionStatus.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  clientApi.widget.firewall.subscribeFirewallVersionStatus.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.firewall.getFirewallVersionStatus.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }

            return prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
          },
        );
      },
    },
  );
  return firewallsVersionData;
};

export const useUpdatingInterfacesStatus = (integrationIds: string[]) => {
  const utils = clientApi.useUtils();
  const [firewallsInterfacesData] = clientApi.widget.firewall.getFirewallInterfacesStatus.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );

  clientApi.widget.firewall.subscribeFirewallInterfacesStatus.useSubscription(
    {
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.firewall.getFirewallInterfacesStatus.setData(
          {
            integrationIds,
          },
          (prevData) => {
            if (!prevData) {
              return undefined;
            }
            return prevData.map((item) =>
              item.integration.id === data.integration.id ? { ...item, summary: data.summary } : item,
            );
          },
        );
      },
    },
  );

  return firewallsInterfacesData;
};

export function formatBitsPerSec(bytes: number, decimals: number): string {
  if (bytes === 0) return "0 b/s";

  const kilobyte = 1024;
  const sizes = ["b/s", "kb/s", "Mb/s", "Gb/s", "Tb/s", "Pb/s", "Eb/s", "Zb/s", "Yb/s"];

  const i = Math.floor(Math.log(bytes) / Math.log(kilobyte));

  return `${parseFloat((bytes / Math.pow(kilobyte, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function calculateBandwidth(data: FirewallInterfacesSummary[]): { data: FirewallInterface[] } {
  const result = {
    data: [] as FirewallInterface[],
    timestamp: new Date().toISOString(),
  };

  if (data.length > 1) {
    const firstData = data[0];
    const secondData = data[1];

    if (firstData && secondData) {
      const time1 = new Date(firstData.timestamp);
      const time2 = new Date(secondData.timestamp);
      const timeDiffInSeconds = (time1.getTime() - time2.getTime()) / 1000;

      firstData.data.forEach((iface) => {
        const ifaceName = iface.name;
        const recv1 = iface.receive;
        const trans1 = iface.transmit;

        const iface2 = secondData.data.find((i) => i.name === ifaceName);

        if (iface2) {
          const recv2 = iface2.receive;
          const trans2 = iface2.transmit;
          const recvDiff = recv1 - recv2;
          const transDiff = trans1 - trans2;

          result.data.push({
            name: ifaceName,
            receive: (8 * recvDiff) / timeDiffInSeconds,
            transmit: (8 * transDiff) / timeDiffInSeconds,
          });
        }
      });
    }
  }

  return result;
}
