import type { LxcResource, NodeResource, QemuResource, StorageResource } from "../../types";

export interface SystemHealthMonitoring {
  version: string;
  cpuModelName: string;
  cpuUtilization: number;
  memUsedInBytes: number;
  memAvailableInBytes: number;
  uptime: number;
  network: {
    up: number;
    down: number;
  } | null;
  loadAverage: {
    "1min": number;
    "5min": number;
    "15min": number;
  } | null;
  rebootRequired: boolean;
  availablePkgUpdates: number;
  cpuTemp: number | undefined;
  fileSystem: {
    deviceName: string;
    used: string;
    available: string;
    percentage: number;
  }[];
  smart: {
    deviceName: string;
    temperature: number | null;
    overallStatus: string;
  }[];
}

// TODO: in the future decouple this from the Proxmox integration
export interface ClusterHealthMonitoring {
  nodes: NodeResource[];
  lxcs: LxcResource[];
  vms: QemuResource[];
  storages: StorageResource[];
}
