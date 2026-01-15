import type tls from "node:tls";
import axios from "axios";
import { HttpCookieAgent, HttpsCookieAgent } from "http-cookie-agent/http";

import { getPortFromUrl } from "@homarr/common";
import {
  getAllTrustedCertificatesAsync,
  getTrustedCertificateHostnamesAsync,
} from "@homarr/core/infrastructure/certificates";
import { createCustomCheckServerIdentity } from "@homarr/core/infrastructure/http";
import type { SiteStats } from "@homarr/node-unifi";
import Unifi from "@homarr/node-unifi";

import { HandleIntegrationErrors } from "../base/errors/decorator";
import { integrationAxiosHttpErrorHandler } from "../base/errors/http";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { NetworkControllerSummaryIntegration } from "../interfaces/network-controller-summary/network-controller-summary-integration";
import type { NetworkControllerSummary } from "../interfaces/network-controller-summary/network-controller-summary-types";
import type { HealthSubsystem } from "./unifi-controller-types";

@HandleIntegrationErrors([integrationAxiosHttpErrorHandler])
export class UnifiControllerIntegration extends Integration implements NetworkControllerSummaryIntegration {
  public async getNetworkSummaryAsync(): Promise<NetworkControllerSummary> {
    const client = await this.createControllerClientAsync();
    const stats = await client.getSitesStats();

    return {
      wanStatus: this.getStatusValueOverAllSites(stats, "wan", (site) => site.status === "ok"),
      www: {
        status: this.getStatusValueOverAllSites(stats, "wan", (site) => site.status === "ok"),
        latency: this.getNumericValueOverAllSites(stats, "www", (site) => site.latency, "max"),
        ping: this.getNumericValueOverAllSites(stats, "www", (site) => site.speedtest_ping, "max"),
        uptime: this.getNumericValueOverAllSites(stats, "www", (site) => site.uptime, "max"),
      },
      wifi: {
        status: this.getStatusValueOverAllSites(stats, "wlan", (site) => site.status === "ok"),
        users: this.getNumericValueOverAllSites(stats, "wlan", (site) => site.num_user, "sum"),
        guests: this.getNumericValueOverAllSites(stats, "wlan", (site) => site.num_guest, "sum"),
      },
      lan: {
        status: this.getStatusValueOverAllSites(stats, "lan", (site) => site.status === "ok"),
        users: this.getNumericValueOverAllSites(stats, "lan", (site) => site.num_user, "sum"),
        guests: this.getNumericValueOverAllSites(stats, "lan", (site) => site.num_guest, "sum"),
      },
      vpn: {
        status: this.getStatusValueOverAllSites(stats, "vpn", (site) => site.status === "ok"),
        users: this.getNumericValueOverAllSites(stats, "vpn", (site) => site.remote_user_num_active, "sum"),
      },
    } satisfies NetworkControllerSummary;
  }

  protected async testingAsync({ options }: IntegrationTestingInput): Promise<TestingResult> {
    const client = await this.createControllerClientAsync(options);
    await client.getSitesStats();
    return { success: true };
  }

  private async createControllerClientAsync(options?: {
    ca: string | string[];
    checkServerIdentity: typeof tls.checkServerIdentity;
  }) {
    const url = new URL(this.integration.url);
    const certificateOptions = options ?? {
      ca: await getAllTrustedCertificatesAsync(),
      checkServerIdentity: createCustomCheckServerIdentity(await getTrustedCertificateHostnamesAsync()),
    };

    const client = new Unifi.Controller({
      host: url.hostname,
      port: getPortFromUrl(url),
      username: this.getSecretValue("username"),
      password: this.getSecretValue("password"),
      createAxiosInstance({ cookies }) {
        return axios.create({
          adapter: "http",
          httpAgent: new HttpCookieAgent({ cookies }),
          httpsAgent: new HttpsCookieAgent({
            cookies,
            requestCert: true,
            ...certificateOptions,
          }),
        });
      },
    });

    await client.login(this.getSecretValue("username"), this.getSecretValue("password"), null);
    return client;
  }

  private getStatusValueOverAllSites<S extends HealthSubsystem>(
    data: SiteStats[],
    subsystem: S,
    selectCallback: (obj: SiteStats["health"][number]) => boolean,
  ) {
    return this.getBooleanValueOverAllSites(data, subsystem, selectCallback) ? "enabled" : "disabled";
  }

  private getNumericValueOverAllSites<
    S extends HealthSubsystem,
    T extends Extract<SiteStats["health"][number], { subsystem: S }>,
  >(data: SiteStats[], subsystem: S, selectCallback: (obj: T) => number, strategy: "average" | "sum" | "max"): number {
    const values = data.map((site) => selectCallback(this.getSubsystem(site.health, subsystem) as T));

    if (strategy === "sum") {
      return values.reduce((first, second) => first + second, 0);
    }

    if (strategy === "average") {
      return values.reduce((first, second, _, array) => first + second / array.length, 0);
    }

    return Math.max(...values);
  }

  private getBooleanValueOverAllSites(
    data: SiteStats[],
    subsystem: HealthSubsystem,
    selectCallback: (obj: SiteStats["health"][number]) => boolean,
  ): boolean {
    return data.every((site) => selectCallback(this.getSubsystem(site.health, subsystem)));
  }

  private getSubsystem(health: SiteStats["health"], subsystem: HealthSubsystem) {
    const value = health.find((health) => health.subsystem === subsystem);
    if (!value) {
      throw new Error(`Subsystem ${subsystem} not found!`);
    }
    return value;
  }
}
