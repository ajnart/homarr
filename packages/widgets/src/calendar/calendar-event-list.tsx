import {
  Badge,
  Box,
  Button,
  darken,
  Group,
  Image,
  lighten,
  ScrollArea,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { IconClock, IconPin } from "@tabler/icons-react";
import dayjs from "dayjs";

import { isNullOrWhitespace } from "@homarr/common";
import type { CalendarEvent } from "@homarr/integrations/types";
import { useI18n } from "@homarr/translation/client";

import classes from "./calendar-event-list.module.css";

interface CalendarEventListProps {
  events: CalendarEvent[];
}

export const CalendarEventList = ({ events }: CalendarEventListProps) => {
  const { colorScheme } = useMantineColorScheme();
  const t = useI18n();
  return (
    <ScrollArea
      offsetScrollbars
      pt={5}
      w="100%"
      styles={{
        viewport: {
          maxHeight: 450,
        },
      }}
    >
      <Stack>
        {events.map((event, eventIndex) => (
          <Group key={`event-${eventIndex}`} align={"stretch"} wrap="nowrap">
            {event.image !== null && (
              <Box pos="relative">
                <Image
                  src={event.image.src}
                  w={70}
                  mah={150}
                  style={{
                    aspectRatio: event.image.aspectRatio
                      ? `${event.image.aspectRatio.width} / ${event.image.aspectRatio.height}`
                      : "1/1",
                  }}
                  radius="sm"
                  fallbackSrc="https://placehold.co/400x400?text=No%20image"
                />
                {event.image.badge !== undefined && (
                  <Badge pos="absolute" bottom={-6} left="50%" w="90%" className={classes.badge}>
                    {event.image.badge.content}
                  </Badge>
                )}
              </Box>
            )}
            <Stack style={{ flexGrow: 1 }} gap={0}>
              <Group justify="space-between" align="start" mb="xs" wrap="nowrap">
                <Stack gap={0}>
                  {event.subTitle !== null && (
                    <Text lineClamp={1} size="sm">
                      {event.subTitle}
                    </Text>
                  )}
                  <Text fw={"bold"} lineClamp={1} size="sm">
                    {event.title}
                  </Text>
                </Stack>
                {event.metadata?.type === "radarr" && (
                  <Group wrap="nowrap">
                    <Text c="dimmed" size="sm">
                      {t(`widget.calendar.option.releaseType.options.${event.metadata.releaseType}`)}
                    </Text>
                  </Group>
                )}

                <Group gap={3} wrap="nowrap" align={"center"}>
                  <IconClock opacity={0.7} size={"1rem"} />
                  {isAllDay(event) ? (
                    <Text c={"dimmed"} size={"sm"}>
                      {t("widget.calendar.duration.allDay")}
                    </Text>
                  ) : (
                    <>
                      <Text c={"dimmed"} size={"sm"}>
                        {dayjs(event.startDate).format("HH:mm")}
                      </Text>

                      {event.endDate !== null && (
                        <>
                          -{" "}
                          <Text c={"dimmed"} size={"sm"}>
                            {dayjs(event.endDate).format("HH:mm")}
                          </Text>
                        </>
                      )}
                    </>
                  )}
                </Group>
              </Group>

              {event.location !== null && (
                <Group gap={4} mb={isNullOrWhitespace(event.description) ? 0 : "sm"}>
                  <IconPin opacity={0.7} size={"1rem"} />
                  <Text size={"xs"} c={"dimmed"} lineClamp={1}>
                    {event.location}
                  </Text>
                </Group>
              )}

              {!isNullOrWhitespace(event.description) && (
                <Text size={"xs"} c={"dimmed"} lineClamp={2}>
                  {event.description}
                </Text>
              )}

              {event.links.length > 0 && (
                <Group pt={5} gap={5} mt={"auto"} wrap="nowrap">
                  {event.links
                    .filter((link) => link.href)
                    .map((link) => (
                      <Button
                        key={link.href}
                        component={"a"}
                        href={link.href.toString()}
                        target={"_blank"}
                        size={"xs"}
                        radius={"xl"}
                        variant={link.color ? undefined : "default"}
                        styles={{
                          root: {
                            backgroundColor: link.color,
                            color: link.isDark && colorScheme === "dark" ? "white" : "black",
                            "&:hover": link.color
                              ? {
                                  backgroundColor: link.isDark ? lighten(link.color, 0.1) : darken(link.color, 0.1),
                                }
                              : undefined,
                          },
                        }}
                        leftSection={link.logo ? <Image src={link.logo} fit="contain" w={20} h={20} /> : undefined}
                      >
                        <Text>{link.name}</Text>
                      </Button>
                    ))}
                </Group>
              )}
            </Stack>
          </Group>
        ))}
      </Stack>
    </ScrollArea>
  );
};

const isAllDay = (event: Pick<CalendarEvent, "startDate" | "endDate">) => {
  if (!event.endDate) return false;

  const start = dayjs(event.startDate);
  const end = dayjs(event.endDate);

  return start.startOf("day").isSame(start) && end.endOf("day").isSame(end);
};
