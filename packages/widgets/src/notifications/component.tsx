"use client";

import { useMemo } from "react";
import { Card, Flex, Group, ScrollArea, Stack, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import { useTimeAgo } from "@homarr/common";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../definition";

export default function NotificationsWidget({ options, integrationIds }: WidgetComponentProps<"notifications">) {
  const [notificationIntegrations] = clientApi.widget.notifications.getNotifications.useSuspenseQuery(
    {
      ...options,
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );
  const utils = clientApi.useUtils();

  clientApi.widget.notifications.subscribeNotifications.useSubscription(
    {
      ...options,
      integrationIds,
    },
    {
      onData: (data) => {
        utils.widget.notifications.getNotifications.setData({ ...options, integrationIds }, (prevData) => {
          return prevData?.map((item) => {
            if (item.integration.id !== data.integration.id) return item;

            return {
              data: data.data,
              integration: {
                ...data.integration,
                updatedAt: new Date(),
              },
            };
          });
        });
      },
    },
  );

  const t = useScopedI18n("widget.notifications");

  const board = useRequiredBoard();

  const sortedNotifications = useMemo(
    () =>
      notificationIntegrations
        .flatMap((integration) => integration.data)
        .sort((entryA, entryB) => entryB.time.getTime() - entryA.time.getTime()),
    [notificationIntegrations],
  );

  return (
    <ScrollArea className="scroll-area-w100" w="100%" p="sm">
      <Stack w={"100%"} gap="sm">
        {sortedNotifications.length > 0 ? (
          sortedNotifications.map((notification) => (
            <Card key={notification.id} withBorder radius={board.itemRadius} w="100%" p="sm">
              <Flex gap="sm" direction="column" w="100%">
                {notification.title && (
                  <Text fz="sm" lh="sm" lineClamp={2}>
                    {notification.title}
                  </Text>
                )}
                <Text c="dimmed" size="sm" lineClamp={4} style={{ whiteSpace: "pre-line" }}>
                  {notification.body}
                </Text>

                <InfoDisplay date={notification.time} />
              </Flex>
            </Card>
          ))
        ) : (
          <Text size="sm" c="dimmed">
            {t("noItems")}
          </Text>
        )}
      </Stack>
    </ScrollArea>
  );
}

const InfoDisplay = ({ date }: { date: Date }) => {
  const timeAgo = useTimeAgo(date, 30000); // update every 30sec

  return (
    <Group gap={5} align={"center"}>
      <IconClock size={"1rem"} color={"var(--mantine-color-dimmed)"} />
      <Text size="sm" c="dimmed">
        {timeAgo}
      </Text>
    </Group>
  );
};
