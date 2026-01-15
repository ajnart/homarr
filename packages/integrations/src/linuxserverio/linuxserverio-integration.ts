import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ReleasesProviderIntegration } from "../interfaces/releases-providers/releases-providers-integration";
import type { ReleaseResponse } from "../interfaces/releases-providers/releases-providers-types";
import { releasesResponseSchema } from "./linuxserverio-schemas";

const logger = createLogger({ module: "linuxServerIOIntegration" });

export class LinuxServerIOIntegration extends Integration implements ReleasesProviderIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/health"));

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
      logger.warn("Invalid identifier format. Expected 'owner/name' for identifier", { identifier });
      return null;
    }
    return { owner, name };
  }

  public async getLatestMatchingReleaseAsync(identifier: string): Promise<ReleaseResponse> {
    const { name } = this.parseIdentifier(identifier) ?? {};
    if (!name) return { success: false, error: { code: "invalidIdentifier" } };

    const releasesResponse = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/images"));
    if (!releasesResponse.ok) {
      return { success: false, error: { code: "unexpected", message: releasesResponse.statusText } };
    }

    const releasesResponseJson: unknown = await releasesResponse.json();
    const { data, success, error } = releasesResponseSchema.safeParse(releasesResponseJson);
    if (!success) {
      return { success: false, error: { code: "unexpected", message: error.message } };
    }

    const release = data.data.repositories.linuxserver.find((repo) => repo.name === name);
    if (!release) {
      logger.warn("Repository not found on provider", {
        name,
      });
      return { success: false, error: { code: "noMatchingVersion" } };
    }

    return {
      success: true,
      data: {
        latestRelease: release.version,
        latestReleaseAt: release.version_timestamp,
        releaseDescription: release.changelog?.shift()?.desc,
        projectUrl: release.github_url,
        projectDescription: release.description,
        isArchived: release.deprecated,
        createdAt: release.initial_date ? new Date(release.initial_date) : undefined,
        starsCount: release.stars,
      },
    };
  }
}
