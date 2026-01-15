import { describe, expect, test } from "vitest";

import type { CalendarEvent } from "@homarr/integrations/types";

import { splitEvents } from "./component";

describe("splitEvents should split multi-day events into multiple single-day events", () => {
  test("2 day all-day event should be split up into two all-day events", () => {
    const event = createEvent(new Date(2025, 0, 1), new Date(2025, 0, 3));

    const result = splitEvents([event]);

    expect(result).toHaveLength(2);
    expect(result[0]?.startDate).toEqual(event.startDate);
    expect(result[0]?.endDate).toEqual(new Date(new Date(2025, 0, 2).getTime() - 1));
    expect(result[1]?.startDate).toEqual(new Date(2025, 0, 2));
    // Because we want to end the event on the previous day, we have not the same endDate.
    // Otherwise there would be three single-day events, with the last being from 0:00 - 0:00
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(result[1]?.endDate).toEqual(new Date(event.endDate!.getTime() - 1));
  });
  test("2 day partial event should be split up into two events", () => {
    const event = createEvent(new Date(2025, 0, 1, 15), new Date(2025, 0, 2, 9));

    const result = splitEvents([event]);

    expect(result).toHaveLength(2);
    expect(result[0]?.startDate).toEqual(event.startDate);
    expect(result[0]?.endDate).toEqual(new Date(new Date(2025, 0, 2).getTime() - 1));
    expect(result[1]?.startDate).toEqual(new Date(2025, 0, 2));
    expect(result[1]?.endDate).toEqual(event.endDate);
  });
  test("one day partial event should only have one event after split", () => {
    const event = createEvent(new Date(2025, 0, 1), new Date(2025, 0, 2));

    const result = splitEvents([event]);

    expect(result).toHaveLength(1);
  });
  test("without endDate should not be split", () => {
    const event = createEvent(new Date(2025, 0, 1));

    const result = splitEvents([event]);

    expect(result).toHaveLength(1);
  });
  test("startDate after endDate should not cause infinite loop", () => {
    const event = createEvent(new Date(2025, 0, 2), new Date(2025, 0, 1));

    const result = splitEvents([event]);

    expect(result).toHaveLength(0);
  });
});

const createEvent = (startDate: Date, endDate: Date | null = null): CalendarEvent => ({
  title: "Test",
  subTitle: null,
  description: null,
  startDate,
  endDate,
  image: null,
  indicatorColor: "red",
  links: [],
  location: null,
});
