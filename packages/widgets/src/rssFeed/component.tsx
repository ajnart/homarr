"use client";

import { Card, Flex, Group, Image, ScrollArea, Stack, Text } from "@mantine/core";
import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";

import type { WidgetComponentProps } from "../definition";
import classes from "./component.module.scss";

export default function RssFeed({ options }: WidgetComponentProps<"rssFeed">) {
  const [feedEntries] = clientApi.widget.rssFeed.getFeeds.useSuspenseQuery(
    {
      urls: options.feedUrls,
      maximumAmountPosts: typeof options.maximumAmountPosts === "number" ? options.maximumAmountPosts : 100,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  );
  const board = useRequiredBoard();

  const languageDir = options.enableRtl ? "RTL" : "LTR";

  return (
    <ScrollArea className="scroll-area-w100" w="100%" p="sm">
      <Stack w={"100%"} gap="sm">
        {feedEntries.map((feedEntry) => (
          <Card
            key={feedEntry.id}
            withBorder
            component={"a"}
            href={feedEntry.link}
            radius={board.itemRadius}
            target="_blank"
            w="100%"
            p="sm"
          >
            {feedEntry.enclosure && (
              <Image className={classes.backgroundImage} src={feedEntry.enclosure} alt="backdrop" />
            )}

            <Flex gap="sm" direction="column" w="100%">
              <Text dir={languageDir} fz="sm" lh="sm" lineClamp={2}>
                {feedEntry.title}
              </Text>
              {!options.hideDescription && feedEntry.description && (
                <Text
                  className={feedEntry.description}
                  dir={languageDir}
                  c="dimmed"
                  size="sm"
                  lineClamp={options.textLinesClamp}
                  dangerouslySetInnerHTML={{ __html: feedEntry.description }}
                />
              )}

              {feedEntry.published && <InfoDisplay date={dayjs(feedEntry.published).fromNow()} />}
            </Flex>
          </Card>
        ))}
      </Stack>
    </ScrollArea>
  );
}

const InfoDisplay = ({ date }: { date: string }) => (
  <Group gap={5} align={"center"}>
    <IconClock size={"1rem"} color={"var(--mantine-color-dimmed)"} />
    <Text size="sm" c="dimmed">
      {date}
    </Text>
  </Group>
);
