import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrDnsHoleSummaryDefinition = CommonOldmarrWidgetDefinition<
  "dns-hole-summary",
  { usePiHoleColors: boolean; layout: "column" | "row" | "grid" }
>;
