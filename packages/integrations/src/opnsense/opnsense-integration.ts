import { ParseError, ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import { createChannelEventHistoryOld } from "../../../redis/src/lib/channel";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { FirewallSummaryIntegration } from "../interfaces/firewall-summary/firewall-summary-integration";
import type {
  FirewallCpuSummary,
  FirewallInterface,
  FirewallInterfacesSummary,
  FirewallMemorySummary,
  FirewallVersionSummary,
} from "../interfaces/firewall-summary/firewall-summary-types";
import {
  opnsenseCPUSchema,
  opnsenseInterfacesSchema,
  opnsenseMemorySchema,
  opnsenseSystemSummarySchema,
} from "./opnsense-types";

export class OPNsenseIntegration extends Integration implements FirewallSummaryIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api/diagnostics/system/system_information"), {
      headers: {
        Authorization: this.getAuthHeaders(),
      },
    });
    if (!response.ok) return TestConnectionError.StatusResult(response);

    const result = await response.json();
    if (typeof result === "object" && result !== null) return { success: true };

    return TestConnectionError.ParseResult(new ParseError("Expected object data"));
  }

  private getAuthHeaders() {
    const key = super.getSecretValue("opnsenseApiKey");
    const secret = super.getSecretValue("opnsenseApiSecret");
    return `Basic ${btoa(`${key}:${secret}`)}`;
  }

  public async getFirewallVersionAsync(): Promise<FirewallVersionSummary> {
    const responseVersion = await fetchWithTrustedCertificatesAsync(
      this.url("/api/diagnostics/system/system_information"),
      {
        headers: {
          Authorization: this.getAuthHeaders(),
        },
      },
    );
    if (!responseVersion.ok) {
      throw new ResponseError(responseVersion);
    }
    const summary = opnsenseSystemSummarySchema.parse(await responseVersion.json());

    return {
      version: summary.versions.at(0) ?? "Unknown",
    };
  }

  private getInterfacesChannel() {
    return createChannelEventHistoryOld<FirewallInterface[]>(`integration:${this.integration.id}:interfaces`, 15);
  }

  public async getFirewallInterfacesAsync(): Promise<FirewallInterfacesSummary[]> {
    const channel = this.getInterfacesChannel();

    const responseInterfaces = await fetchWithTrustedCertificatesAsync(this.url("/api/diagnostics/traffic/interface"), {
      headers: {
        Authorization: this.getAuthHeaders(),
      },
    });

    if (!responseInterfaces.ok) {
      throw new ResponseError(responseInterfaces);
    }
    const interfaces = opnsenseInterfacesSchema.parse(await responseInterfaces.json());

    const returnValue: FirewallInterface[] = [];
    const interfaceKeys = Object.keys(interfaces.interfaces);

    for (const key of interfaceKeys) {
      const inter = interfaces.interfaces[key];
      if (!inter) continue;

      const bytesTransmitted = inter["bytes transmitted"];
      const bytesReceived = inter["bytes received"];
      const receiveValue = parseInt(bytesReceived, 10);
      const transmitValue = parseInt(bytesTransmitted, 10);

      returnValue.push({
        name: inter.name,
        receive: receiveValue,
        transmit: transmitValue,
      });
    }

    await channel.pushAsync(returnValue);

    return await channel.getSliceAsync(0, 1);
  }

  public async getFirewallMemoryAsync(): Promise<FirewallMemorySummary> {
    const responseMemory = await fetchWithTrustedCertificatesAsync(
      this.url("/api/diagnostics/system/system_resources"),
      {
        headers: {
          Authorization: this.getAuthHeaders(),
        },
      },
    );
    if (!responseMemory.ok) {
      throw new ResponseError(responseMemory);
    }

    const memory = opnsenseMemorySchema.parse(await responseMemory.json());

    // Using parseInt for memoryTotal is normal, the api sends the total memory as a string
    const memoryTotal = parseInt(memory.memory.total);
    const memoryUsed = memory.memory.used;
    const memoryPercent = (100 * memoryUsed) / memoryTotal;
    return {
      total: memoryTotal,
      used: memoryUsed,
      percent: memoryPercent,
    };
  }

  public async getFirewallCpuAsync(): Promise<FirewallCpuSummary> {
    const responseCpu = await fetchWithTrustedCertificatesAsync(this.url("/api/diagnostics/cpu_usage/stream"), {
      headers: {
        Authorization: this.getAuthHeaders(),
      },
    });

    if (!responseCpu.ok) {
      throw new ResponseError(responseCpu);
    }

    if (!responseCpu.body) {
      throw new Error("ReadableStream not supported in this environment.");
    }

    const reader = responseCpu.body.getReader();
    const decoder = new TextDecoder();
    let loopCounter = 0;
    try {
      while (loopCounter < 10) {
        loopCounter++;
        const result = await reader.read();
        if (result.done) {
          break;
        }
        if (!(result.value instanceof Uint8Array)) {
          throw new Error("Received value is not an Uint8Array.");
        }

        const value: AllowSharedBufferSource = result.value;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) {
            continue;
          }
          if (loopCounter < 2) {
            continue;
          }
          const data = line.substring(5).trim();
          const cpuValues = opnsenseCPUSchema.parse(JSON.parse(data));

          return {
            ...cpuValues,
          };
        }
      }

      throw new Error("No valid CPU data found.");
    } finally {
      await reader.cancel();
    }
  }
}
