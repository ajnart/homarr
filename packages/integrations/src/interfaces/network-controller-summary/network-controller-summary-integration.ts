import type { NetworkControllerSummary } from "./network-controller-summary-types";

export interface NetworkControllerSummaryIntegration {
  getNetworkSummaryAsync(): Promise<NetworkControllerSummary>;
}
