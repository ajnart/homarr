import type { ClusterHealthMonitoring, SystemHealthMonitoring } from "./health-monitoring-types";

export interface ISystemHealthMonitoringIntegration {
  getSystemInfoAsync(): Promise<SystemHealthMonitoring>;
}

export interface IClusterHealthMonitoringIntegration {
  getClusterInfoAsync(): Promise<ClusterHealthMonitoring>;
}
