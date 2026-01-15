import type { IClusterHealthMonitoringIntegration } from "../../interfaces/health-monitoring/health-monitoring-integration";
import type { ClusterHealthMonitoring } from "../../types";

export class ClusterHealthMonitoringMockService implements IClusterHealthMonitoringIntegration {
  public async getClusterInfoAsync(): Promise<ClusterHealthMonitoring> {
    return Promise.resolve({
      nodes: Array.from({ length: 5 }, (_, index) => ClusterHealthMonitoringMockService.createNode(index)),
      lxcs: Array.from({ length: 3 }, (_, index) => ClusterHealthMonitoringMockService.createLxc(index)),
      vms: Array.from({ length: 7 }, (_, index) => ClusterHealthMonitoringMockService.createVm(index)),
      storages: Array.from({ length: 9 }, (_, index) => ClusterHealthMonitoringMockService.createStorage(index)),
    });
  }

  private static createNode(index: number): ClusterHealthMonitoring["nodes"][number] {
    return {
      id: index.toString(),
      name: `Node ${index}`,
      isRunning: Math.random() > 0.1, // 90% chance of being running
      node: `Node ${index}`,
      status: Math.random() > 0.5 ? "online" : "offline",
      type: "node",
      uptime: Math.floor(Math.random() * 1000000), // Randomly generate uptime in seconds
      haState: null,
      ...this.createResourceUsage(),
    };
  }

  private static createResourceUsage() {
    const totalMemory = Math.pow(2, Math.floor(Math.random() * 6) + 1) * 1024 * 1024 * 1024; // Randomly generate between 2GB and 64GB
    const totalStorage = Math.pow(2, Math.floor(Math.random() * 6) + 1) * 1024 * 1024 * 1024; // Randomly generate between 2GB and 64GB

    return {
      cpu: {
        cores: Math.pow(2, Math.floor(Math.random() * 5) + 1), // Randomly generate between 2 and 32 cores,
        utilization: Math.random(),
      },
      memory: {
        total: totalMemory,
        used: Math.floor(Math.random() * totalMemory), // Randomly generate used memory
      },
      network: {
        in: Math.floor(Math.random() * 1000), // Randomly generate network in
        out: Math.floor(Math.random() * 1000), // Randomly generate network out
      },
      storage: {
        total: totalStorage,
        used: Math.floor(Math.random() * totalStorage), // Randomly generate used storage
        read: Math.floor(Math.random() * 1000), // Randomly generate read
        write: Math.floor(Math.random() * 1000), // Randomly generate write
      },
    };
  }

  private static createVm(index: number): ClusterHealthMonitoring["vms"][number] {
    return {
      id: index.toString(),
      name: `VM ${index}`,
      vmId: index + 1000, // VM IDs start from 1000
      ...this.createResourceUsage(),
      haState: null,
      isRunning: Math.random() > 0.1, // 90% chance of being running
      node: `Node ${Math.floor(index / 2)}`, // Assign to a node
      status: Math.random() > 0.5 ? "online" : "offline",
      type: "qemu",
      uptime: Math.floor(Math.random() * 1000000), // Randomly generate uptime in seconds
    };
  }

  private static createLxc(index: number): ClusterHealthMonitoring["lxcs"][number] {
    return {
      id: index.toString(),
      name: `LXC ${index}`,
      vmId: index + 2000, // LXC IDs start from 2000
      ...this.createResourceUsage(),
      haState: null,
      isRunning: Math.random() > 0.1, // 90% chance of being running
      node: `Node ${Math.floor(index / 2)}`, // Assign to a node
      status: Math.random() > 0.5 ? "online" : "offline",
      type: "lxc",
      uptime: Math.floor(Math.random() * 1000000), // Randomly generate uptime in seconds
    };
  }

  private static createStorage(index: number): ClusterHealthMonitoring["storages"][number] {
    const total = Math.pow(2, Math.floor(Math.random() * 6) + 1) * 1024 * 1024 * 1024; // Randomly generate between 2GB and 64GB

    return {
      id: index.toString(),
      name: `Storage ${index}`,
      isRunning: Math.random() > 0.1, // 90% chance of being running
      node: `Node ${Math.floor(index / 2)}`, // Assign to a node
      status: Math.random() > 0.5 ? "online" : "offline",
      isShared: Math.random() > 0.5, // 50% chance of being shared
      storagePlugin: `Plugin ${index}`,
      total,
      used: Math.floor(Math.random() * total), // Randomly generate used storage
      type: "storage",
    };
  }
}
