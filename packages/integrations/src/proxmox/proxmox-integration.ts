import type { Proxmox } from "proxmox-api";
import proxmoxApi from "proxmox-api";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { HandleIntegrationErrors } from "../base/errors/decorator";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IClusterHealthMonitoringIntegration } from "../interfaces/health-monitoring/health-monitoring-integration";
import { ProxmoxApiErrorHandler } from "./proxmox-error-handler";
import type {
  ComputeResourceBase,
  LxcResource,
  NodeResource,
  QemuResource,
  Resource,
  StorageResource,
} from "./proxmox-types";

const logger = createLogger({ module: "proxmoxIntegration" });

@HandleIntegrationErrors([new ProxmoxApiErrorHandler()])
export class ProxmoxIntegration extends Integration implements IClusterHealthMonitoringIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const proxmox = this.getPromoxApi(input.fetchAsync);
    await proxmox.nodes.$get();
    return { success: true };
  }

  public async getClusterInfoAsync() {
    const proxmox = this.getPromoxApi();
    const resources = await proxmox.cluster.resources.$get();

    logger.info("Found resources in Proxmox cluster", {
      total: resources.length,
      node: resources.filter((resource) => resource.type === "node").length,
      lxc: resources.filter((resource) => resource.type === "lxc").length,
      qemu: resources.filter((resource) => resource.type === "qemu").length,
      storage: resources.filter((resource) => resource.type === "storage").length,
    });

    const mappedResources = resources.map(mapResource).filter((resource) => resource !== null);
    return {
      nodes: mappedResources.filter((resource): resource is NodeResource => resource.type === "node"),
      lxcs: mappedResources.filter((resource): resource is LxcResource => resource.type === "lxc"),
      vms: mappedResources.filter((resource): resource is QemuResource => resource.type === "qemu"),
      storages: mappedResources.filter((resource): resource is StorageResource => resource.type === "storage"),
    };
  }

  private getPromoxApi(fetchAsync = fetchWithTrustedCertificatesAsync) {
    return proxmoxApi({
      host: this.url("/").host,
      tokenID: `${this.getSecretValue("username")}@${this.getSecretValue("realm")}!${this.getSecretValue("tokenId")}`,
      tokenSecret: this.getSecretValue("apiKey"),
      fetch: fetchAsync,
    });
  }
}

const mapResource = (resource: Proxmox.clusterResourcesResources): Resource | null => {
  switch (resource.type) {
    case "node":
      return mapNodeResource(resource);
    case "lxc":
    case "qemu":
      return mapVmResource(resource);
    case "storage":
      return mapStorageResource(resource);
  }

  return null;
};

const mapComputeResource = (resource: Proxmox.clusterResourcesResources): Omit<ComputeResourceBase<string>, "type"> => {
  return {
    id: resource.id,
    cpu: {
      utilization: resource.cpu ?? 0,
      cores: resource.maxcpu ?? 0,
    },
    memory: {
      used: resource.mem ?? 0,
      total: resource.maxmem ?? 0,
    },
    storage: {
      used: resource.disk ?? 0,
      total: resource.maxdisk ?? 0,
      read: (resource.diskread as number | null) ?? null,
      write: (resource.diskwrite as number | null) ?? null,
    },
    network: {
      in: (resource.netin as number | null) ?? null,
      out: (resource.netout as number | null) ?? null,
    },
    haState: resource.hastate ?? null,
    isRunning: resource.status === "running" || resource.status === "online",
    name: resource.name ?? "",
    node: resource.node ?? "",
    status: resource.status ?? (resource.type === "node" ? "offline" : "stopped"),
    uptime: resource.uptime ?? 0,
  };
};

const mapNodeResource = (resource: Proxmox.clusterResourcesResources): NodeResource => {
  return {
    type: "node",
    ...mapComputeResource(resource),
    name: resource.node ?? "",
  };
};

const mapVmResource = (resource: Proxmox.clusterResourcesResources): LxcResource | QemuResource => {
  return {
    type: resource.type as "lxc" | "qemu",
    vmId: resource.vmid ?? 0,
    ...mapComputeResource(resource),
  };
};

const mapStorageResource = (resource: Proxmox.clusterResourcesResources): StorageResource => {
  return {
    id: resource.id,
    type: "storage",
    name: resource.storage ?? "",
    node: resource.node ?? "",
    isRunning: resource.status === "available",
    status: resource.status ?? "offline",
    storagePlugin: resource.storage ?? "",
    total: resource.maxdisk ?? 0,
    used: resource.disk ?? 0,
    isShared: resource.shared === 1,
  };
};
