import type { NetworkControllerSummaryIntegration } from "../../interfaces/network-controller-summary/network-controller-summary-integration";
import type { NetworkControllerSummary } from "../../types";

export class NetworkControllerSummaryMockService implements NetworkControllerSummaryIntegration {
  public async getNetworkSummaryAsync(): Promise<NetworkControllerSummary> {
    return await Promise.resolve({
      lan: {
        guests: 5,
        users: 10,
        status: "enabled",
      },
      vpn: {
        users: 3,
        status: "enabled",
      },
      wanStatus: "disabled",
      wifi: {
        status: "disabled",
        guests: 0,
        users: 0,
      },
      www: {
        latency: 22,
        status: "enabled",
        ping: 32,
        uptime: 3600,
      },
    });
  }
}
