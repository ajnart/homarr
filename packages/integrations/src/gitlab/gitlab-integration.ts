import type { Gitlab as CoreGitlab } from "@gitbeaker/core";
import { createRequesterFn, defaultOptionsHandler } from "@gitbeaker/requester-utils";
import type { FormattedResponse, RequestOptions, ResourceOptions } from "@gitbeaker/requester-utils";
import { Gitlab } from "@gitbeaker/rest";

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
  ReleaseProviderResponse,
  ReleaseResponse,
} from "../interfaces/releases-providers/releases-providers-types";

const logger = createLogger({ module: "gitlabIntegration" });

export class GitlabIntegration extends Integration implements ReleasesProviderIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api/v4/projects"), {
      headers: {
        ...(this.hasSecretValue("personalAccessToken")
          ? { Authorization: `Bearer ${this.getSecretValue("personalAccessToken")}` }
          : {}),
      },
    });

    if (!response.ok) {
      return TestConnectionError.StatusResult(response);
    }

    return {
      success: true,
    };
  }

  public async getLatestMatchingReleaseAsync(identifier: string, versionRegex?: string): Promise<ReleaseResponse> {
    const api = this.getApi();

    try {
      const releasesResponse = await api.ProjectReleases.all(identifier, {
        perPage: 100,
      });

      if (releasesResponse instanceof Error) {
        logger.warn("No releases found", {
          identifier,
          error: releasesResponse.message,
        });
        return { success: false, error: { code: "noReleasesFound" } };
      }

      const releasesProviderResponse = releasesResponse.reduce<ReleaseProviderResponse[]>((acc, release) => {
        if (!release.released_at) return acc;

        const releaseDate = new Date(release.released_at);

        acc.push({
          latestRelease: release.name ?? release.tag_name,
          latestReleaseAt: releaseDate,
          releaseUrl: release._links.self,
          releaseDescription: release.description ?? undefined,
          isPreRelease: releaseDate > new Date(), // For upcoming releases the `released_at` will be set to the future (https://docs.gitlab.com/api/releases/#upcoming-releases). Gitbreaker doesn't currently support the `upcoming_release` field (https://github.com/jdalrymple/gitbeaker/issues/3730)
        });
        return acc;
      }, []);

      const latestRelease = getLatestRelease(releasesProviderResponse, versionRegex);
      if (!latestRelease) return { success: false, error: { code: "noMatchingVersion" } };

      const details = await this.getDetailsAsync(api, identifier);

      return { success: true, data: { ...details, ...latestRelease } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.warn("Failed to get releases", {
        identifier,
        error: errorMessage,
      });
      return { success: false, error: { code: "unexpected", message: errorMessage } };
    }
  }

  protected async getDetailsAsync(api: CoreGitlab, identifier: string): Promise<DetailsProviderResponse | undefined> {
    try {
      const response = await api.Projects.show(identifier);

      if (response instanceof Error) {
        logger.warn("Failed to get details", {
          identifier,
          error: response.message,
        });

        return undefined;
      }

      if (!response.web_url) {
        logger.warn("No web URL found", {
          identifier,
        });
        return undefined;
      }

      return {
        projectUrl: response.web_url,
        projectDescription: response.description ?? undefined,
        isFork: response.forked_from_project !== null,
        isArchived: response.archived,
        createdAt: new Date(response.created_at),
        starsCount: response.star_count,
        openIssues: response.open_issues_count,
        forksCount: response.forks_count,
      };
    } catch (error) {
      logger.warn("Failed to get details", {
        identifier,
        error: error instanceof Error ? error.message : String(error),
      });

      return undefined;
    }
  }

  private getApi() {
    return new Gitlab({
      host: this.url("/").origin,
      requesterFn: createRequesterFn(
        async (serviceOptions: ResourceOptions, _: RequestOptions) => await defaultOptionsHandler(serviceOptions),
        async (endpoint: string, options?: Record<string, unknown>): Promise<FormattedResponse> => {
          if (options === undefined) {
            throw new Error("Gitlab library is not configured correctly. Options must be provided.");
          }

          const response = await fetchWithTrustedCertificatesAsync(
            `${options.prefixUrl as string}${endpoint}`,
            options,
          );
          const headers = Object.fromEntries(response.headers.entries());

          return {
            status: response.status,
            headers,
            body: await response.json(),
          } as FormattedResponse;
        },
      ),
      ...(this.hasSecretValue("personalAccessToken") ? { token: this.getSecretValue("personalAccessToken") } : {}),
    });
  }
}
