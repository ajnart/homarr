import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ReleasesProviderIntegration } from "../interfaces/releases-providers/releases-providers-integration";
import { getLatestRelease } from "../interfaces/releases-providers/releases-providers-integration";
import type { ReleaseResponse } from "../interfaces/releases-providers/releases-providers-types";
import { releasesResponseSchema } from "./npm-schemas";

export class NPMIntegration extends Integration implements ReleasesProviderIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/"));

    if (!response.ok) {
      return TestConnectionError.StatusResult(response);
    }

    return {
      success: true,
    };
  }

  public async getLatestMatchingReleaseAsync(identifier: string, versionRegex?: string): Promise<ReleaseResponse> {
    if (!identifier) return { success: false, error: { code: "invalidIdentifier" } };

    const releasesResponse = await fetchWithTrustedCertificatesAsync(this.url(`/${encodeURIComponent(identifier)}`));
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

    const formattedReleases = data.time.map((tag) => ({
      ...tag,
      releaseUrl: `https://www.npmjs.com/package/${encodeURIComponent(data.name)}/v/${encodeURIComponent(tag.latestRelease)}`,
      releaseDescription: data.versions[tag.latestRelease]?.description ?? "",
    }));

    const latestRelease = getLatestRelease(formattedReleases, versionRegex);
    if (!latestRelease) return { success: false, error: { code: "noMatchingVersion" } };

    return { success: true, data: latestRelease };
  }
}
