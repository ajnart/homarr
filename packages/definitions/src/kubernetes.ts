export const kubernetesNodeStates = ["Ready", "NotReady"] as const;
export const kubernetesNamespaceStates = ["Active", "Terminating"] as const;
export const kubernetesResourceTypes = ["Reserved", "Used"] as const;
export const kubernetesCapacityTypes = ["Pods", "CPU", "Memory"] as const;
export const kubernetesLabelResourceTypes = [
  "configmaps",
  "pods",
  "ingresses",
  "namespaces",
  "nodes",
  "secrets",
  "services",
  "volumes",
] as const;

export type KubernetesNodeState = (typeof kubernetesNodeStates)[number];
export type KubernetesNamespaceState = (typeof kubernetesNamespaceStates)[number];
export type KubernetesResourceType = (typeof kubernetesResourceTypes)[number];
export type KubernetesCapacityType = (typeof kubernetesCapacityTypes)[number];
export type KubernetesLabelResourceType = (typeof kubernetesLabelResourceTypes)[number];

export interface KubernetesBaseResource {
  name: string;
  namespace?: string;
  creationTimestamp?: Date;
}

export interface KubernetesVolume extends KubernetesBaseResource {
  accessModes: string[];
  storage: string;
  storageClassName: string;
  volumeMode: string;
  volumeName: string;
  status: string;
}

export interface KubernetesSecret extends KubernetesBaseResource {
  type: string;
}

export interface KubernetesPod extends KubernetesBaseResource {
  image?: string;
  applicationType: string;
  status: string;
}

export interface KubernetesService extends KubernetesBaseResource {
  type: string;
  ports?: string[];
  targetPorts?: string[];
  clusterIP: string;
}

export interface KubernetesIngressPath {
  serviceName: string;
  port: number;
}

export interface KubernetesIngressRuleAndPath {
  host: string;
  paths: KubernetesIngressPath[];
}

export interface KubernetesIngress extends KubernetesBaseResource {
  className: string;
  rulesAndPaths: KubernetesIngressRuleAndPath[];
}

export interface KubernetesNamespace extends KubernetesBaseResource {
  status: KubernetesNamespaceState;
}

export interface KubernetesNode {
  name: string;
  status: KubernetesNodeState;
  allocatableCpuPercentage: number;
  allocatableRamPercentage: number;
  podsCount: number;
  operatingSystem?: string;
  architecture?: string;
  kubernetesVersion?: string;
  creationTimestamp?: Date;
}

export interface KubernetesCluster {
  name: string;
  providers: string;
  kubernetesVersion: string;
  architecture: string;
  nodeCount: number;
  capacity: KubernetesCapacity[];
}

export interface KubernetesCapacity {
  type: KubernetesCapacityType;
  resourcesStats: KubernetesResourceStat[];
}

export interface KubernetesResourceStat {
  percentageValue: number;
  type: KubernetesResourceType;
  capacityUnit?: string;
  usedValue: number;
  maxUsedValue: number;
}

export interface ClusterResourceCount {
  label: string;
  count: number;
}
