"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import timezones from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

import type { WidgetComponentProps } from "../definition";

dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezones);

export default function ClockWidget({ options, width }: WidgetComponentProps<"clock">) {
  const secondsFormat = options.showSeconds ? ":ss" : "";
  const timeFormat = options.is24HourFormat ? `HH:mm${secondsFormat}` : `hh:mm${secondsFormat} A`;
  const dateFormat = options.dateFormat;
  const customTimeFormat = options.customTimeFormat;
  const customDateFormat = options.customDateFormat;
  const timezone = options.useCustomTimezone ? options.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = useCurrentTime(options);

  const sizing = width < 128 ? "xs" : width < 196 ? "sm" : "md";

  return (
    <Stack className="clock-text-stack" h="100%" align="center" justify="center" gap={sizing}>
      {options.customTitleToggle && (
        <Text className="clock-customTitle-text" size={sizing} ta="center">
          {options.customTitle}
        </Text>
      )}
      <Title className="clock-time-text" fw={700} order={sizing === "md" ? 2 : sizing === "sm" ? 4 : 6} lh="1">
        {options.customTimeFormat
          ? dayjs(time).tz(timezone).format(customTimeFormat)
          : dayjs(time).tz(timezone).format(timeFormat)}
      </Title>
      {options.showDate && (
        <Text className="clock-date-text" size={sizing} lineClamp={1}>
          {options.customDateFormat
            ? dayjs(time).tz(timezone).format(customDateFormat)
            : dayjs(time).tz(timezone).format(dateFormat)}
        </Text>
      )}
    </Stack>
  );
}

interface UseCurrentTimeProps {
  showSeconds: boolean;
}

const useCurrentTime = ({ showSeconds }: UseCurrentTimeProps) => {
  const [time, setTime] = useState(new Date());
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const intervalMultiplier = useMemo(() => (showSeconds ? 1 : 60), [showSeconds]);

  useEffect(() => {
    setTime(new Date());
    timeoutRef.current = setTimeout(
      () => {
        setTime(new Date());

        intervalRef.current = setInterval(() => {
          setTime(new Date());
        }, intervalMultiplier * 1000);
      },
      intervalMultiplier * 1000 - (1000 * (showSeconds ? 0 : dayjs().second()) + dayjs().millisecond()),
    );

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMultiplier, showSeconds]);

  return time;
};
