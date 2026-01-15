import type { RequestInit, Response } from "undici";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ReleasesProviderIntegration } from "../interfaces/releases-providers/releases-providers-integration";
import { getLatestRelease } from "../interfaces/releases-providers/releases-providers-integration";
import type {
  DetailsProviderResponse,
  ReleaseResponse,
} from "../interfaces/releases-providers/releases-providers-types";
import { detailsResponseSchema, releasesResponseSchema } from "./codeberg-schemas";

const logger = createLogger({ module: "codebergIntegration" });

export class CodebergIntegration extends Integration implements ReleasesProviderIntegration {
  private async withHeadersAsync(callback: (headers: RequestInit["headers"]) => Promise<Response>): Promise<Response> {
    if (!this.hasSecretValue("personalAccessToken")) return await callback(undefined);

    return await callback({
      Authorization: `token ${this.getSecretValue("personalAccessToken")}`,
    });
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await this.withHeadersAsync(async (headers) => {
      return await input.fetchAsync(this.url("/version"), {
        headers,
      });
    });

    if (!response.ok) {
      return TestConnectionError.StatusResult(response);
    }

    return {
      success: true,
    };
  }

  private parseIdentifier(identifier: string) {
    const [owner, name] = identifier.split("/");
    if (!owner || !name) {
      logger.warn("Invalid identifier format. Expected 'owner/name', for identifier", {
        identifier,
      });
      return null;
    }
    return { owner, name };
  }

  public async getLatestMatchingReleaseAsync(identifier: string, versionRegex?: string): Promise<ReleaseResponse> {
    const parsedIdentifier = this.parseIdentifier(identifier);
    if (!parsedIdentifier) return { success: false, error: { code: "invalidIdentifier" } };

    const { owner, name } = parsedIdentifier;

    const releasesResponse = await this.withHeadersAsync(async (headers) => {
      return await fetchWithTrustedCertificatesAsync(
        this.url(`/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/releases`),
        { headers },
      );
    });
    if (!releasesResponse.ok) {
      return { success: false, error: { code: "unexpected", message: releasesResponse.statusText } };
    }

    const releasesResponseJson: unknown = await releasesResponse.json();
    const { data, success, error } = releasesResponseSchema.safeParse(releasesResponseJson);
    if (!success) {
      return {
        success: false,
        error: {
          code: "unexpected",
          message: releasesResponseJson ? JSON.stringify(releasesResponseJson, null, 2) : error.message,
        },
      };
    }

    const formattedReleases = data.map((tag) => ({
      latestRelease: tag.tag_name,
      latestReleaseAt: tag.published_at,
      releaseUrl: tag.url,
      releaseDescription: tag.body,
      isPreRelease: tag.prerelease,
    }));

    const latestRelease = getLatestRelease(formattedReleases, versionRegex);
    if (!latestRelease) return { success: false, error: { code: "noMatchingVersion" } };

    const details = await this.getDetailsAsync(owner, name);

    return { success: true, data: { ...details, ...latestRelease } };
  }

  protected async getDetailsAsync(owner: string, name: string): Promise<DetailsProviderResponse | undefined> {
    const response = await this.withHeadersAsync(async (headers) => {
      return await fetchWithTrustedCertificatesAsync(
        this.url(`/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`),
        {
          headers,
        },
      );
    });

    if (!response.ok) {
      logger.warn("Failed to get details", {
        owner,
        name,
        error: response.statusText,
      });

      return undefined;
    }

    const responseJson = await response.json();
    const { data, success, error } = detailsResponseSchema.safeParse(responseJson);

    if (!success) {
      logger.warn("Failed to parse details", {
        owner,
        name,
        error,
      });

      return undefined;
    }

    return {
      projectUrl: data.html_url,
      projectDescription: data.description,
      isFork: data.fork,
      isArchived: data.archived,
      createdAt: data.created_at,
      starsCount: data.stars_count,
      openIssues: data.open_issues_count,
      forksCount: data.forks_count,
    };
  }
}
