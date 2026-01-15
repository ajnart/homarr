interface ResourceBase<TType extends string> {
  type: TType;
  name: string;
  node: string;
  isRunning: boolean;
  status: string;
}

export interface ComputeResourceBase<TType extends string> extends ResourceBase<TType> {
  id: string;
  cpu: {
    utilization: number; // previously cpu (0-1)
    cores: number; // previously cpuCores
  };
  memory: {
    used: number; // previously mem
    total: number; // previously maxMem
  };
  storage: {
    used: number; // previously disk
    total: number; // previously maxDisk
    read: number | null; // previously diskRead
    write: number | null; // previously diskWrite
  };
  network: {
    in: number | null; // previously netIn
    out: number | null; // previously netOut
  };
  uptime: number; // expressed in seconds
  haState: string | null; // HA service status (for HA managed VMs).
}

export type NodeResource = ComputeResourceBase<"node">;

export interface LxcResource extends ComputeResourceBase<"lxc"> {
  vmId: number;
}

export interface QemuResource extends ComputeResourceBase<"qemu"> {
  vmId: number;
}

export interface StorageResource extends ResourceBase<"storage"> {
  id: string;
  storagePlugin: string;
  used: number; // previously disk
  total: number; // previously maxDisk
  isShared: boolean; // previously storageShared
}

export type ComputeResource = NodeResource | LxcResource | QemuResource;
export type Resource = ComputeResource | StorageResource;

export interface ProxmoxClusterInfo {
  nodes: NodeResource[];
  lxcs: LxcResource[];
  vms: QemuResource[];
  storages: StorageResource[];
}
