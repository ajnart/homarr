import { IconClock } from "@tabler/icons-react";
import dayjs from "dayjs";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("clock", {
  icon: IconClock,
  createOptions() {
    return optionsBuilder.from(
      (factory) => ({
        customTitleToggle: factory.switch({
          defaultValue: false,
          withDescription: true,
        }),
        customTitle: factory.text({
          defaultValue: "",
        }),
        is24HourFormat: factory.switch({
          defaultValue: true,
          withDescription: true,
        }),
        showSeconds: factory.switch({
          defaultValue: false,
        }),
        useCustomTimezone: factory.switch({ defaultValue: false }),
        timezone: factory.select({
          options: Intl.supportedValuesOf("timeZone").map((value) => value),
          defaultValue: "Europe/London",
          searchable: true,
          withDescription: true,
        }),
        showDate: factory.switch({
          defaultValue: true,
        }),
        dateFormat: factory.select({
          options: [
            { value: "dddd, MMMM D", label: dayjs().format("dddd, MMMM D") },
            { value: "dddd, D MMMM", label: dayjs().format("dddd, D MMMM") },
            { value: "MMM D", label: dayjs().format("MMM D") },
            { value: "D MMM", label: dayjs().format("D MMM") },
            { value: "DD/MM/YYYY", label: dayjs().format("DD/MM/YYYY") },
            { value: "MM/DD/YYYY", label: dayjs().format("MM/DD/YYYY") },
            { value: "DD/MM", label: dayjs().format("DD/MM") },
            { value: "MM/DD", label: dayjs().format("MM/DD") },
          ],
          defaultValue: "dddd, MMMM D",
          withDescription: true,
        }),
        customTimeFormat: factory.text({
          defaultValue: "",
          withDescription: true,
        }),
        customDateFormat: factory.text({
          defaultValue: "",
          withDescription: true,
        }),
      }),
      {
        customTitle: {
          shouldHide: (options) => !options.customTitleToggle,
        },
        timezone: {
          shouldHide: (options) => !options.useCustomTimezone,
        },
        dateFormat: {
          shouldHide: (options) => !options.showDate,
        },
      },
    );
  },
}).withDynamicImport(() => import("./component"));
