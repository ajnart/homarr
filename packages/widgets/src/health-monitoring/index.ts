import { IconHeartRateMonitor, IconServerOff } from "@tabler/icons-react";

import { getIntegrationKindsByCategory } from "@homarr/definitions";

import { createWidgetDefinition } from "../definition";
import { optionsBuilder } from "../options";

export const { definition, componentLoader } = createWidgetDefinition("healthMonitoring", {
  icon: IconHeartRateMonitor,
  createOptions() {
    return optionsBuilder.from(
      (factory) => ({
        fahrenheit: factory.switch({
          defaultValue: false,
        }),
        cpu: factory.switch({
          defaultValue: true,
        }),
        memory: factory.switch({
          defaultValue: true,
        }),
        showUptime: factory.switch({
          defaultValue: true,
        }),
        fileSystem: factory.switch({
          defaultValue: true,
        }),
        visibleClusterSections: factory.multiSelect({
          options: [
            {
              value: "node",
              label: (t) => t("widget.healthMonitoring.cluster.resource.node.name"),
            },
            {
              value: "qemu",
              label: (t) => t("widget.healthMonitoring.cluster.resource.qemu.name"),
            },
            {
              value: "lxc",
              label: (t) => t("widget.healthMonitoring.cluster.resource.lxc.name"),
            },
            {
              value: "storage",
              label: (t) => t("widget.healthMonitoring.cluster.resource.storage.name"),
            },
          ] as const,
          defaultValue: ["node", "qemu", "lxc", "storage"] as const,
        }),
        defaultTab: factory.select({
          defaultValue: "system",
          options: [
            { value: "system", label: "System" },
            { value: "cluster", label: "Cluster" },
          ] as const,
        }),
        sectionIndicatorRequirement: factory.select({
          defaultValue: "all",
          options: [
            { value: "all", label: "All active" },
            { value: "any", label: "Any active" },
          ] as const,
        }),
      }),
      {
        fahrenheit: {
          shouldHide(_, integrationKinds) {
            // File system is only shown on system health tab
            return integrationKinds.every((kind) => kind === "proxmox") || integrationKinds.length === 0;
          },
        },
        fileSystem: {
          shouldHide(_, integrationKinds) {
            // File system is only shown on system health tab
            return integrationKinds.every((kind) => kind === "proxmox") || integrationKinds.length === 0;
          },
        },
        showUptime: {
          shouldHide(_, integrationKinds) {
            // Uptime is only shown on cluster health tab
            return !integrationKinds.includes("proxmox");
          },
        },
        sectionIndicatorRequirement: {
          shouldHide(_, integrationKinds) {
            // Section indicator requirement is only shown on cluster health tab
            return !integrationKinds.includes("proxmox");
          },
        },
        visibleClusterSections: {
          shouldHide(_, integrationKinds) {
            // Cluster sections are only shown on cluster health tab
            return !integrationKinds.includes("proxmox");
          },
        },
      },
    );
  },
  supportedIntegrations: getIntegrationKindsByCategory("healthMonitoring"),
  errors: {
    INTERNAL_SERVER_ERROR: {
      icon: IconServerOff,
      message: (t) => t("widget.healthMonitoring.error.internalServerError"),
    },
  },
}).withDynamicImport(() => import("./component"));
