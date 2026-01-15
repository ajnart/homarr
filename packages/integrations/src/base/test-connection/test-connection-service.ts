import type { X509Certificate } from "node:crypto";
import tls from "node:tls";

import { getPortFromUrl } from "@homarr/common";
import {
  getAllTrustedCertificatesAsync,
  getTrustedCertificateHostnamesAsync,
} from "@homarr/core/infrastructure/certificates";
import { createCustomCheckServerIdentity } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { IntegrationRequestErrorOfType } from "../errors/http/integration-request-error";
import { IntegrationRequestError } from "../errors/http/integration-request-error";
import { IntegrationError } from "../errors/integration-error";
import type { AnyTestConnectionError } from "./test-connection-error";
import { TestConnectionError } from "./test-connection-error";

const logger = createLogger({
  module: "testConnectionService",
});

export type TestingResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: AnyTestConnectionError;
    };
type AsyncTestingCallback = (input: {
  ca: string[] | string;
  checkServerIdentity: typeof tls.checkServerIdentity;
}) => Promise<TestingResult>;

export class TestConnectionService {
  constructor(private url: URL) {}

  public async handleAsync(testingCallbackAsync: AsyncTestingCallback) {
    logger.debug("Testing connection", {
      url: this.url.toString(),
    });

    const testingResult = await testingCallbackAsync({
      ca: await getAllTrustedCertificatesAsync(),
      checkServerIdentity: createCustomCheckServerIdentity(await getTrustedCertificateHostnamesAsync()),
    })
      .then((result) => {
        if (result.success) return result;

        const error = result.error;
        if (error instanceof TestConnectionError) return error.toResult();

        return TestConnectionError.UnknownResult(error);
      })
      .catch((error: unknown) => {
        if (!(error instanceof IntegrationError)) {
          return TestConnectionError.UnknownResult(error);
        }

        if (!(error instanceof IntegrationRequestError)) {
          return TestConnectionError.FromIntegrationError(error).toResult();
        }

        if (error.cause.type !== "certificate") {
          return TestConnectionError.FromIntegrationError(error).toResult();
        }

        return {
          success: false,
          error: error as IntegrationRequestErrorOfType<"certificate">,
        } as const;
      });

    if (testingResult.success) {
      logger.debug("Testing connection succeeded", {
        url: this.url.toString(),
      });

      return testingResult;
    }

    logger.debug("Testing connection failed", {
      url: this.url.toString(),
      error: `${testingResult.error.name}: ${testingResult.error.message}`,
    });

    if (!(testingResult.error instanceof IntegrationRequestError)) {
      return testingResult.error.toResult();
    }

    const certificate = await this.fetchCertificateAsync();
    if (!certificate) {
      return TestConnectionError.UnknownResult(new Error("Unable to fetch certificate"));
    }

    return TestConnectionError.CertificateResult(testingResult.error.cause, certificate);
  }

  private async fetchCertificateAsync(): Promise<X509Certificate | undefined> {
    logger.debug("Fetching certificate", {
      url: this.url.toString(),
    });

    const url = this.url;
    const port = getPortFromUrl(url);
    const socket = await new Promise<tls.TLSSocket>((resolve, reject) => {
      try {
        const innerSocket = tls.connect(
          {
            host: url.hostname,
            servername: url.hostname,
            port,
            rejectUnauthorized: false,
          },
          () => {
            resolve(innerSocket);
          },
        );
      } catch (error) {
        reject(new Error("Unable to fetch certificate", { cause: error }));
      }
    });

    const x509 = socket.getPeerX509Certificate();
    socket.destroy();

    logger.debug("Fetched certificate", {
      url: this.url.toString(),
      subject: x509?.subject,
      issuer: x509?.issuer,
    });
    return x509;
  }
}
