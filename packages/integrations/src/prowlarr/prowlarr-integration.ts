import { z } from "zod/v4";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IIndexerManagerIntegration } from "../interfaces/indexer-manager/indexer-manager-integration";
import type { Indexer } from "../interfaces/indexer-manager/indexer-manager-types";
import { indexerResponseSchema, statusResponseSchema } from "./prowlarr-types";

export class ProwlarrIntegration extends Integration implements IIndexerManagerIntegration {
  public async getIndexersAsync(): Promise<Indexer[]> {
    const apiKey = super.getSecretValue("apiKey");

    const indexerResponse = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/indexer"), {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    if (!indexerResponse.ok) {
      throw new Error(
        `Failed to fetch indexers for ${this.integration.name} (${this.integration.id}): ${indexerResponse.statusText}`,
      );
    }

    const statusResponse = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/indexerstatus"), {
      headers: {
        "X-Api-Key": apiKey,
      },
    });
    if (!statusResponse.ok) {
      throw new Error(
        `Failed to fetch status for ${this.integration.name} (${this.integration.id}): ${statusResponse.statusText}`,
      );
    }

    const indexersResult = indexerResponseSchema.array().safeParse(await indexerResponse.json());
    const statusResult = statusResponseSchema.safeParse(await statusResponse.json());

    const errorMessages: string[] = [];
    if (!indexersResult.success) {
      errorMessages.push(`Indexers parsing error: ${indexersResult.error.message}`);
    }
    if (!statusResult.success) {
      errorMessages.push(`Status parsing error: ${statusResult.error.message}`);
    }
    if (!indexersResult.success || !statusResult.success) {
      throw new Error(
        `Failed to parse indexers for ${this.integration.name} (${this.integration.id}), most likely your api key is wrong:\n${errorMessages.join("\n")}`,
      );
    }

    const inactiveIndexerIds = new Set(statusResult.data.map((status: { indexerId: number }) => status.indexerId));

    const indexers: Indexer[] = indexersResult.data.map((indexer) => ({
      id: indexer.id,
      name: indexer.name,
      url: indexer.indexerUrls[0] ?? "",
      enabled: indexer.enable,
      status: !inactiveIndexerIds.has(indexer.id),
    }));

    return indexers;
  }

  public async testAllAsync(): Promise<void> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/indexer/testall"), {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to test all indexers for ${this.integration.name} (${this.integration.id}): ${response.statusText}`,
      );
    }
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await input.fetchAsync(this.url("/api"), {
      headers: {
        "X-Api-Key": apiKey,
      },
    });

    if (!response.ok) return TestConnectionError.StatusResult(response);

    const responseSchema = z.object({});

    await responseSchema.parseAsync(await response.json());
    return { success: true };
  }
}
