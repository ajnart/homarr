export type ResourceSummary = {
  vms: ResourceData[];
  lxcs: ResourceData[];
  nodes: ResourceData[];
  storage: ResourceData[];
};

export type ResourceData = {
  id: string;
  cpu: number;
  maxCpu: number;
  maxMem: number;
  mem: number;
  name: string;
  node: string;
  status: string;
  running: boolean;
  type: string;
  uptime: number;
  vmId: number;
  netIn: number;
  netOut: number;
  diskRead: number;
  diskWrite: number;
  disk: number;
  maxDisk: number;
  haState: string;
  storagePlugin: string;
  storageShared: boolean;
};