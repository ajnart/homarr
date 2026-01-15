import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrHealthMonitoringDefinition = CommonOldmarrWidgetDefinition<
  "health-monitoring",
  {
    fahrenheit: boolean;
    cpu: boolean;
    memory: boolean;
    fileSystem: boolean;
    defaultTabState: "system" | "cluster";
    node: string;
    defaultViewState: "storage" | "none" | "node" | "vm" | "lxc";
    summary: boolean;
    showNode: boolean;
    showVM: boolean;
    showLXCs: boolean;
    showStorage: boolean;
    sectionIndicatorColor: "all" | "any";
    ignoreCert: boolean;
  }
>;
