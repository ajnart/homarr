import dayjs from "dayjs";
import z from "zod";

import { createId } from "@homarr/common";
import { RequestError, ResponseError } from "@homarr/common/server";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ISystemHealthMonitoringIntegration } from "../interfaces/health-monitoring/health-monitoring-integration";
import type { SystemHealthMonitoring } from "../interfaces/health-monitoring/health-monitoring-types";

const logger = createLogger({ module: "trueNasIntegration" });

const NETWORK_MULTIPLIER = 100;

export class TrueNasIntegration extends Integration implements ISystemHealthMonitoringIntegration {
  private static webSocketMap = new Map<string, WebSocket>();

  private wsUrl() {
    const url = super.url("/websocket");
    url.protocol = url.protocol.replace("http", "ws");
    return url;
  }

  private get webSocket() {
    return TrueNasIntegration.webSocketMap.get(this.integration.id) ?? null;
  }

  protected async testingAsync(_input: IntegrationTestingInput): Promise<TestingResult> {
    const webSocket = await this.connectWebSocketAsync();
    await this.registerSessionAsync(webSocket);
    await this.authenticateWebSocketAsync(webSocket);

    // Remove current socket connection so we can authenticate with updated credentials
    TrueNasIntegration.webSocketMap.delete(this.integration.id);

    return { success: true };
  }

  /**
   * TrueNAS API uses WebSocket. This function connects to the socket
   * and resolves the promise if the connection was successful.
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html
   */
  private async connectWebSocketAsync(): Promise<WebSocket> {
    logger.debug("Connecting to websocket server", {
      url: this.wsUrl(),
    });
    const webSocket = new WebSocket(this.wsUrl());

    return new Promise((resolve, reject) => {
      webSocket.onopen = () => {
        logger.debug("Connected to websocket server", {
          url: this.wsUrl(),
        });
        resolve(webSocket);
      };

      webSocket.onerror = () => {
        reject(new Error("Failed to connect"));
      };
    });
  }

  /**
   * Before authentication, a session must be obtained from the server using the "connect" event.
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html#websocket_protocol
   */
  private async registerSessionAsync(webSocket: WebSocket): Promise<void> {
    return new Promise((resolve, reject) => {
      const subscribe = (event: MessageEvent<string>) => {
        const data = JSON.parse(event.data) as { msg: string };
        if (data.msg === "connected") {
          webSocket.removeEventListener("message", subscribe);
          resolve();
        } else if (data.msg === "failed") {
          webSocket.removeEventListener("message", subscribe);
          reject(new Error("Unable to establish connection"));
        }
      };

      webSocket.addEventListener("message", subscribe);
      webSocket.send(
        JSON.stringify({
          msg: "connect",
          version: "1", // this must be number, not string
          support: ["1"], // this must be number, not string
        }),
      );
    });
  }

  /**
   * After a session was obtained, the session can be authenticated.
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html#websocket_protocol
   */
  private async authenticateWebSocketAsync(webSocket?: WebSocket): Promise<void> {
    logger.debug("Authenticating with username and password", {
      url: this.wsUrl(),
    });
    const response = await this.requestAsync(
      "auth.login",
      [this.getSecretValue("username"), this.getSecretValue("password")],
      webSocket,
    );
    const result = await z.boolean().parseAsync(response);
    if (!result) throw new ResponseError({ status: 401 });
    logger.debug("Authenticated successfully with username and password", {
      url: this.wsUrl(),
    });
  }

  /**
   * Retrieves data using the reporting method
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html#reporting
   */
  private async getReportingAsync(): Promise<ReportingItem[]> {
    logger.debug("Retrieving reporting data", {
      url: this.wsUrl(),
    });

    const response = await this.requestAsync("reporting.get_data", [
      [
        {
          name: "cpu",
        },
        {
          name: "memory",
        },
        {
          name: "cputemp",
        },
      ],
      {
        aggregate: true,
        start: dayjs().add(-5, "minutes").unix(),
        end: dayjs().unix(),
      },
    ]);
    const result = await z.array(reportingItemSchema).parseAsync(response);

    logger.debug("Retrieved reporting data", {
      url: this.wsUrl(),
      count: result.length,
    });
    return result;
  }

  /**
   * Retrieves a list of all available network interfaces
   * @see https://www.truenas.com/docs/core/13.0/api/core_websocket_api.html#interface
   */
  private async getNetworkInterfacesAsync(): Promise<z.infer<typeof networkInterfaceSchema>> {
    logger.debug("Retrieving available network-interfaces", {
      url: this.wsUrl(),
    });

    const response = await this.requestAsync("interface.query", [
      [], // no filters
      {},
    ]);
    const result = await networkInterfaceSchema.parseAsync(response);

    logger.debug("Retrieved available network-interfaces", {
      url: this.wsUrl(),
      count: result.length,
    });
    return result;
  }

  /**
   * Retrieves reporting network data of the last 5 minutes
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html#reporting
   */
  private async getReportingNetdataAsync(): Promise<z.infer<typeof reportingNetDataSchema>> {
    const networkInterfaces = await this.getNetworkInterfacesAsync();

    logger.debug("Retrieving reporting network data", {
      url: this.wsUrl(),
    });

    const response = await this.requestAsync("reporting.netdata_get_data", [
      networkInterfaces.map((networkInterface) => ({
        name: "interface",
        identifier: networkInterface.id,
      })),
      {
        start: dayjs().add(-5, "minutes").unix(),
        end: dayjs().unix(),
      },
    ]);
    const result = await reportingNetDataSchema.parseAsync(response);

    logger.debug("Retrieved reporting-network-data", {
      url: this.wsUrl(),
      count: result.length,
    });
    return result;
  }

  /**
   * Retrieves information about the system
   * @see https://www.truenas.com/docs/api/scale_websocket_api.html#system
   */
  private async getSystemInformationAsync(): Promise<z.infer<typeof systemInfoSchema>> {
    logger.debug("Retrieving system-information", {
      url: this.wsUrl(),
    });

    const response = await this.requestAsync("system.info");
    const result = await systemInfoSchema.parseAsync(response);

    logger.debug("Retrieved system-information", {
      url: this.wsUrl(),
    });
    return result;
  }

  public async getSystemInfoAsync(): Promise<SystemHealthMonitoring> {
    const systemInformation = await this.getSystemInformationAsync();
    const reporting = await this.getReportingAsync();

    const cpuData = this.extractLatestReportingData(reporting, "cpu");
    const cpuTempData = this.extractLatestReportingData(reporting, "cputemp");
    const memoryData = this.extractLatestReportingData(reporting, "memory");

    const netdata = await this.getReportingNetdataAsync();

    const upload = this.extractNetworkTrafficData(netdata, 2); // Index 2 is "sent"
    const download = this.extractNetworkTrafficData(netdata, 1); // Index 1 is "received"

    return {
      cpuUtilization: cpuData.reduce((acc, item) => acc + (item > 100 ? 0 : item), 0) / cpuData.length,
      cpuTemp: Math.max(...cpuTempData.filter((_item, i) => i > 0)),
      memAvailableInBytes: systemInformation.physmem,
      memUsedInBytes: memoryData[1] ?? 0, // Index 0 is UNIX timestamp, Index 1 is free space in bytes
      fileSystem: [],
      availablePkgUpdates: 0,
      network: {
        up: upload * NETWORK_MULTIPLIER,
        down: download * NETWORK_MULTIPLIER,
      },
      loadAverage: null,
      smart: [],
      uptime: systemInformation.uptime_seconds,
      version: systemInformation.version,
      cpuModelName: systemInformation.model,
      rebootRequired: false,
    };
  }

  /**
   * Send a request through websocket and return response
   * Times out after 5 seconds when no response was received.
   * @param method json-rpc method to call
   * @param params array of parameters
   * @param webSocketOverride override of webSocket, helpful for not storing the connection
   * @returns result of json-rpc call
   */
  private async requestAsync(method: string, params: unknown[] = [], webSocketOverride?: WebSocket) {
    let webSocket = webSocketOverride ?? this.webSocket;
    if (webSocket?.readyState !== WebSocket.OPEN) {
      logger.debug("Connecting to websocket", {
        url: this.wsUrl(),
      });
      // We can only land here with static webSocket
      webSocket = await this.connectWebSocketAsync();
      await this.registerSessionAsync(webSocket);

      TrueNasIntegration.webSocketMap.set(this.integration.id, webSocket);
      await this.authenticateWebSocketAsync();
    }

    return await new Promise((resolve, reject) => {
      const id = createId();
      const handler = (event: MessageEvent<string>) => {
        const data = JSON.parse(event.data) as Record<string, unknown>;
        if (data.msg !== "result") return;
        if (data.id !== id) return;

        clearTimeout(timeoutId);
        webSocket.removeEventListener("message", handler);
        logger.debug("Received method response", {
          id,
          method,
          url: this.wsUrl(),
        });
        resolve(data.result);
      };
      const timeoutId = setTimeout(() => {
        webSocket.removeEventListener("message", handler);
        reject(
          new RequestError(
            {
              type: "timeout",
              reason: "aborted",
              code: "ECONNABORTED",
            },
            { cause: new Error("Canceled request after 5 seconds") },
          ),
        );
      }, 5000);

      webSocket.addEventListener("message", handler);

      logger.debug("Sending method request", {
        id,
        method,
        url: this.wsUrl(),
      });

      webSocket.send(
        JSON.stringify({
          id,
          msg: "method",
          method,
          params,
        }),
      );
    });
  }

  private extractNetworkTrafficData = (data: z.infer<typeof reportingNetDataSchema>, index = 1 | 2) => {
    return data.reduce((acc, current) => acc + (current.data.at(-1)?.at(index) ?? 0), 0);
  };

  private extractLatestReportingData(data: ReportingItem[], key: ReportingItem["identifier"]) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const dataObject = data.find((item) => item.identifier === key)!;
    // TODO: check why the below sorting is done, because right now it compares number[] with number[]?
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return dataObject.data.sort((item1, item2) => (item1 > item2 ? -1 : 1))[0]!;
  }
}

const reportingItemSchema = z.object({
  name: z.enum(["cpu", "memory", "cputemp"]),
  identifier: z.enum(["cpu", "memory", "cputemp"]),
  aggregations: z.object({
    min: z.record(z.string(), z.unknown()),
    mean: z.record(z.string(), z.unknown()),
    max: z.record(z.string(), z.unknown()),
  }),
  start: z.number().min(0),
  end: z.number().min(0),
  legend: z.array(z.string()),
  data: z.array(z.array(z.number())),
});

type ReportingItem = z.infer<typeof reportingItemSchema>;

const reportingNetDataSchema = z.array(
  z.object({
    name: z.string(),
    identifier: z.string(),
    data: z.array(z.array(z.number())),
  }),
);

const systemInfoSchema = z.object({
  version: z.string(),
  hostname: z.string(),
  physmem: z.number().min(0), // pysical memory
  model: z.string(), // cpu model
  uptime_seconds: z.number().min(0),
});

const networkInterfaceSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
  }),
);
