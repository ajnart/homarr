import type { SystemHealthMonitoring } from "../..";
import type { ISystemHealthMonitoringIntegration } from "../../interfaces/health-monitoring/health-monitoring-integration";

export class SystemHealthMonitoringMockService implements ISystemHealthMonitoringIntegration {
  public async getSystemInfoAsync(): Promise<SystemHealthMonitoring> {
    return await Promise.resolve({
      version: "1.0.0",
      cpuModelName: "Mock CPU",
      cpuUtilization: Math.random(),
      memUsedInBytes: 4 * 1024 * 1024 * 1024, // 4 GB in bytes
      memAvailableInBytes: 8 * 1024 * 1024 * 1024, // 8 GB in bytes
      availablePkgUpdates: 0,
      network: {
        up: 1024 * 16,
        down: 1024 * 16 * 6,
      },
      rebootRequired: false,
      cpuTemp: Math.floor(Math.random() * 100), // Random temperature between 0 and 99
      uptime: Math.floor(Math.random() * 1000000), // Random uptime in seconds
      fileSystem: Array.from({ length: 3 }, (_, index) => ({
        deviceName: `sha${index + 1}`,
        used: "1 GB",
        available: "500 MB",
        percentage: Math.floor(Math.random() * 100), // Random percentage between 0 and 99
      })),
      loadAverage: {
        "1min": Math.random() * 10,
        "5min": Math.random() * 10,
        "15min": Math.random() * 10,
      },
      smart: [
        {
          deviceName: "Mock Device",
          temperature: Math.floor(Math.random() * 100), // Random temperature between 0 and 99
          overallStatus: "OK",
        },
      ],
    });
  }
}
