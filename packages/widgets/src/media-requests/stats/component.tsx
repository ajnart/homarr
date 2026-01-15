"use client";

import { Avatar, Card, Grid, Group, Stack, Text, Tooltip } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import {
  IconDeviceTv,
  IconHourglass,
  IconLoaderQuarter,
  IconMovie,
  IconPlayerPlay,
  IconReceipt,
  IconThumbDown,
  IconThumbUp,
} from "@tabler/icons-react";
import combineClasses from "clsx";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import type { RequestStats } from "@homarr/integrations/types";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../../definition";
import { NoIntegrationDataError } from "../../errors/no-data-integration";
import classes from "./component.module.css";

export default function MediaServerWidget({
  integrationIds,
  isEditMode,
  width,
}: WidgetComponentProps<"mediaRequests-requestStats">) {
  const t = useScopedI18n("widget.mediaRequests-requestStats");
  const [requestStats] = clientApi.widget.mediaRequests.getStats.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const board = useRequiredBoard();

  if (requestStats.users.length === 0 && requestStats.stats.length === 0) throw new NoIntegrationDataError();

  const data = [
    {
      name: "approved",
      icon: IconThumbUp,
      number: requestStats.stats.reduce((count, { approved }) => count + approved, 0),
    },
    {
      name: "pending",
      icon: IconHourglass,
      number: requestStats.stats.reduce((count, { pending }) => count + pending, 0),
    },
    {
      name: "processing",
      icon: IconLoaderQuarter,
      number: requestStats.stats.reduce((count, { processing }) => count + processing, 0),
    },
    {
      name: "declined",
      icon: IconThumbDown,
      number: requestStats.stats.reduce((count, { declined }) => count + declined, 0),
    },
    {
      name: "available",
      icon: IconPlayerPlay,
      number: requestStats.stats.reduce((count, { available }) => count + available, 0),
    },
    {
      name: "tv",
      icon: IconDeviceTv,
      number: requestStats.stats.reduce((count, { tv }) => count + tv, 0),
    },
    {
      name: "movie",
      icon: IconMovie,
      number: requestStats.stats.reduce((count, { movie }) => count + movie, 0),
    },
    {
      name: "total",
      icon: IconReceipt,
      number: requestStats.stats.reduce((count, { total }) => count + total, 0),
    },
  ] satisfies { name: keyof RequestStats; icon: Icon; number: number }[];

  const isTiny = width < 256;

  return (
    <Stack
      className="mediaRequests-stats-layout"
      h="100%"
      gap="xs"
      p="sm"
      align="center"
      justify="space-between"
      style={{ pointerEvents: isEditMode ? "none" : undefined }}
    >
      <Stack gap={4} w="100%">
        <Text className="mediaRequests-stats-stats-title" fw="bold" ta="center" size={isTiny ? "xs" : "sm"}>
          {t("titles.stats.main")}
        </Text>
        <Grid className="mediaRequests-stats-stats-grid" gutter={4} w="100%">
          {data.map((stat) => (
            <Grid.Col
              className={combineClasses("mediaRequests-stats-stat-wrapper", `mediaRequests-stats-stat-${stat.name}`)}
              key={stat.name}
              span={isTiny ? 6 : 3}
            >
              <Tooltip label={t(`titles.stats.${stat.name}`)}>
                <Card p={0} radius={board.itemRadius} className={classes.card}>
                  <Group className="mediaRequests-stats-stat-stack" justify="center" align="center" gap="xs" w="100%">
                    <stat.icon className="mediaRequests-stats-stat-icon" size={16} />
                    <Text className="mediaRequests-stats-stat-value" size="md">
                      {stat.number}
                    </Text>
                  </Group>
                </Card>
              </Tooltip>
            </Grid.Col>
          ))}
        </Grid>
      </Stack>
      <Stack gap={4} w="100%">
        <Text className="mediaRequests-stats-users-title" fw="bold" ta="center" size={isTiny ? "xs" : "sm"}>
          {t("titles.users.main")} ({t("titles.users.requests")})
        </Text>
        <Stack className="mediaRequests-stats-users-wrapper" flex={1} w="100%" gap={4} style={{ overflow: "hidden" }}>
          {requestStats.users.slice(0, 10).map((user) => (
            <Card
              component="a"
              href={user.link}
              target="_blank"
              rel="noopener noreferrer"
              className={combineClasses(
                "mediaRequests-stats-users-user-wrapper",
                `mediaRequests-stats-users-user-${user.id}`,
                classes.card,
              )}
              key={user.id}
              p="xs"
              radius={board.itemRadius}
            >
              <Group className="mediaRequests-stats-users-user-group" h="100%" p={0} gap="sm" justify="space-between">
                <Group gap={4}>
                  <Tooltip label={user.integration.name}>
                    <Avatar
                      className="mediaRequests-stats-users-user-avatar"
                      size={20}
                      src={user.avatar}
                      bd={`2px solid ${user.integration.kind === "overseerr" ? "#ECB000" : "#6677CC"}`}
                    />
                  </Tooltip>
                  <Text className="mediaRequests-stats-users-user-userName" size="sm">
                    {user.displayName}
                  </Text>
                </Group>

                <Text className="mediaRequests-stats-users-user-request-count" size="md" fw={500}>
                  {user.requestCount}
                </Text>
              </Group>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
