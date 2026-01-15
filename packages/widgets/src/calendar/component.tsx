"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMantineTheme } from "@mantine/core";
import { Calendar } from "@mantine/dates";
import { useElementSize } from "@mantine/hooks";
import dayjs from "dayjs";

import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import type { CalendarEvent } from "@homarr/integrations/types";
import { useSettings } from "@homarr/settings";

import type { WidgetComponentProps } from "../definition";
import { CalendarDay } from "./calender-day";
import classes from "./component.module.css";

export default function CalendarWidget(props: WidgetComponentProps<"calendar">) {
  const [month, setMonth] = useState(new Date());

  if (props.integrationIds.length === 0) {
    return <CalendarBase {...props} events={[]} month={month} setMonth={setMonth} />;
  }

  return <FetchCalendar month={month} setMonth={setMonth} {...props} />;
}

interface FetchCalendarProps extends WidgetComponentProps<"calendar"> {
  month: Date;
  setMonth: (date: Date) => void;
}

const FetchCalendar = ({ month, setMonth, isEditMode, integrationIds, options }: FetchCalendarProps) => {
  const input = {
    integrationIds,
    month: month.getMonth(),
    year: month.getFullYear(),
    releaseType: options.releaseType,
    showUnmonitored: options.showUnmonitored,
  };
  const [data] = clientApi.widget.calendar.findAllEvents.useSuspenseQuery(input, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
  });

  const utils = clientApi.useUtils();
  clientApi.widget.calendar.subscribeToEvents.useSubscription(input, {
    onData(data) {
      utils.widget.calendar.findAllEvents.setData(input, (old) => {
        return old?.map((item) => {
          if (item.integration.id !== data.integration.id) return item;
          return {
            ...item,
            events: data.events,
          };
        });
      });
    },
  });

  const events = useMemo(() => data.flatMap((item) => item.events), [data]);

  return <CalendarBase isEditMode={isEditMode} events={events} month={month} setMonth={setMonth} options={options} />;
};

interface CalendarBaseProps {
  isEditMode: boolean;
  events: CalendarEvent[];
  month: Date;
  setMonth: (date: Date) => void;
  options: WidgetComponentProps<"calendar">["options"];
}

const CalendarBase = ({ isEditMode, events, month, setMonth, options }: CalendarBaseProps) => {
  const params = useParams();
  const locale = params.locale as string;
  const { firstDayOfWeek } = useSettings();
  const board = useRequiredBoard();
  const mantineTheme = useMantineTheme();
  const actualItemRadius = mantineTheme.radius[board.itemRadius];
  const { ref, width, height } = useElementSize();
  const isSmall = width < 256;

  const normalizedEvents = useMemo(() => splitEvents(events), [events]);

  return (
    <Calendar
      defaultDate={new Date()}
      onPreviousMonth={(month) => setMonth(new Date(month))}
      onNextMonth={(month) => setMonth(new Date(month))}
      highlightToday
      locale={locale}
      hideWeekdays={false}
      date={month}
      maxLevel="month"
      firstDayOfWeek={firstDayOfWeek}
      static={isEditMode}
      className={classes.calendar}
      w="100%"
      h="100%"
      ref={ref}
      styles={{
        calendarHeaderControl: {
          pointerEvents: isEditMode ? "none" : undefined,
          borderRadius: "md",
          height: isSmall ? "1.5rem" : undefined,
          width: isSmall ? "1.5rem" : undefined,
        },
        calendarHeaderLevel: {
          pointerEvents: "none",
          fontSize: isSmall ? "0.75rem" : undefined,
          height: "100%",
        },
        levelsGroup: {
          height: "100%",
          padding: "md",
        },
        calendarHeader: {
          maxWidth: "unset",
          marginBottom: 0,
        },
        monthCell: {
          textAlign: "center",
          position: "relative",
        },
        day: {
          borderRadius: actualItemRadius,
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        },
        month: {
          height: "100%",
        },
        weekday: {
          padding: 0,
        },
        weekdaysRow: {
          height: 22,
        },
      }}
      renderDay={(tileDate) => {
        const eventsForDate = normalizedEvents
          .filter((event) => dayjs(event.startDate).isSame(tileDate, "day"))
          .filter(
            (event) => event.metadata?.type !== "radarr" || options.releaseType.includes(event.metadata.releaseType),
          )
          .sort((eventA, eventB) => eventA.startDate.getTime() - eventB.startDate.getTime());

        return (
          <CalendarDay
            // new Date() does not work here, because for timezones like UTC-7 it will
            // show one day earlier (probably due to the time being set to 00:00)
            // see https://github.com/homarr-labs/homarr/pull/3120
            date={dayjs(tileDate).toDate()}
            events={eventsForDate}
            disabled={isEditMode || eventsForDate.length === 0}
            rootWidth={width}
            rootHeight={height}
          />
        );
      }}
    />
  );
};

/**
 * Splits multi-day events into multiple single-day events.
 * @param events The events to split.
 * @returns The split events.
 */
export const splitEvents = (events: CalendarEvent[]): CalendarEvent[] => {
  const splitEvents: CalendarEvent[] = [];
  for (const event of events) {
    if (!event.endDate) {
      splitEvents.push(event);
      continue;
    }

    if (dayjs(event.startDate).isSame(event.endDate, "day")) {
      splitEvents.push(event);
      continue;
    }

    if (dayjs(event.startDate).isAfter(event.endDate)) {
      // Invalid event, skip it
      continue;
    }

    // Event spans multiple days, split it
    let currentStart = dayjs(event.startDate);

    while (currentStart.isBefore(event.endDate)) {
      splitEvents.push({
        ...event,
        startDate: currentStart.toDate(),
        endDate: currentStart.endOf("day").isAfter(event.endDate) ? event.endDate : currentStart.endOf("day").toDate(),
      });

      currentStart = currentStart.add(1, "day").startOf("day");
    }
  }
  return splitEvents;
};
