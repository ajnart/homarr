"use client";

import { Box, Flex, Group, Text, Tooltip } from "@mantine/core";
import { IconCube, IconUsersGroup } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { formatNumber } from "@homarr/common";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../../definition";

export default function MinecraftServerStatusWidget({ options }: WidgetComponentProps<"minecraftServerStatus">) {
  const [{ data }] = clientApi.widget.minecraft.getServerStatus.useSuspenseQuery(options);
  const utils = clientApi.useUtils();
  clientApi.widget.minecraft.subscribeServerStatus.useSubscription(options, {
    onData(data) {
      utils.widget.minecraft.getServerStatus.setData(options, {
        data,
        timestamp: new Date(),
      });
    },
  });
  const tStatus = useScopedI18n("widget.minecraftServerStatus.status");

  const title = options.title.trim().length > 0 ? options.title : options.domain;

  return (
    <Flex
      className="minecraftServerStatus-wrapper"
      h="100%"
      w="100%"
      direction="column"
      p="sm"
      justify="center"
      align="center"
    >
      <Group gap="xs" wrap="nowrap" align="center">
        <Tooltip label={data.online ? tStatus("online") : tStatus("offline")}>
          <Box miw="md" h="md" bg={data.online ? "teal" : "red"} style={{ borderRadius: "100%" }}></Box>
        </Tooltip>
        <Text size="md" fw="bold">
          {title}
        </Text>
      </Group>
      {data.online && (
        <>
          {!options.isBedrockServer &&
            (data.icon ? (
              <img
                style={{ flex: 1, transform: "scale(0.8)", objectFit: "contain" }}
                alt={`minecraft icon ${options.domain}`}
                src={data.icon}
              />
            ) : (
              <Box
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconCube size="3rem" color="var(--mantine-color-gray-5)" />
              </Box>
            ))}
          <Group gap={5} c="gray.6" align="center">
            <IconUsersGroup size="1rem" />
            <Text size="md">
              {formatNumber(data.players.online, 1)} / {formatNumber(data.players.max, 1)}
            </Text>
          </Group>
        </>
      )}
    </Flex>
  );
}
