import type {
  FirewallCpuSummary,
  FirewallInterfacesSummary,
  FirewallMemorySummary,
  FirewallVersionSummary,
} from "./firewall-summary-types";

export interface FirewallSummaryIntegration {
  getFirewallCpuAsync(): Promise<FirewallCpuSummary>;
  getFirewallMemoryAsync(): Promise<FirewallMemorySummary>;
  getFirewallInterfacesAsync(): Promise<FirewallInterfacesSummary[]>;
  getFirewallVersionAsync(): Promise<FirewallVersionSummary>;
}
