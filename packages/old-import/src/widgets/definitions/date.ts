import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrDateDefinition = CommonOldmarrWidgetDefinition<
  "date",
  {
    timezone: string;
    customTitle: string;
    display24HourFormat: boolean;
    dateFormat:
      | "hide"
      | "dddd, MMMM D"
      | "dddd, D MMMM"
      | "MMM D"
      | "D MMM"
      | "DD/MM/YYYY"
      | "MM/DD/YYYY"
      | "DD/MM"
      | "MM/DD";
    titleState: "none" | "city" | "both";
  }
>;
