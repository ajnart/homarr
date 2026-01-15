export interface NetworkControllerSummary {
  wanStatus: "enabled" | "disabled";

  www: {
    status: "enabled" | "disabled";
    latency: number;
    ping: number;
    uptime: number;
  };

  wifi: {
    status: "enabled" | "disabled";
    users: number;
    guests: number;
  };

  lan: {
    status: "enabled" | "disabled";
    users: number;
    guests: number;
  };

  vpn: {
    status: "enabled" | "disabled";
    users: number;
  };
}
