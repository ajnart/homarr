export interface FirewallInterfacesSummary {
  data: FirewallInterface[];
  timestamp: Date;
}

export interface FirewallInterface {
  name: string;
  receive: number;
  transmit: number;
}

export interface FirewallVersionSummary {
  version: string;
}

export interface FirewallCpuSummary {
  total: number;
}

export interface FirewallMemorySummary {
  used: number;
  total: number;
  percent: number;
}
