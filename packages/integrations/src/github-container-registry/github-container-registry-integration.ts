import { createAppAuth } from "@octokit/auth-app";
import { Octokit, RequestError } from "octokit";
import type { fetch } from "undici";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { HandleIntegrationErrors } from "../base/errors/decorator";
import { integrationOctokitHttpErrorHandler } from "../base/errors/http";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { ReleasesProviderIntegration } from "../interfaces/releases-providers/releases-providers-integration";
import { getLatestRelease } from "../interfaces/releases-providers/releases-providers-integration";
import type {
  DetailsProviderResponse,
  ReleaseProviderResponse,
  ReleaseResponse,
} from "../interfaces/releases-providers/releases-providers-types";

const logger = createLogger({ module: "githubContainerRegistryIntegration" });

@HandleIntegrationErrors([integrationOctokitHttpErrorHandler])
export class GitHubContainerRegistryIntegration extends Integration implements ReleasesProviderIntegration {
  private static readonly userAgent = "Homarr-Lab/Homarr:GitHubContainerRegistryIntegration";

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const api = this.getApi(input.fetchAsync);

    if (this.hasSecretValue("personalAccessToken")) {
      await api.rest.users.getAuthenticated();
    } else if (this.hasSecretValue("githubAppId")) {
      await api.rest.apps.getInstallation({
        installation_id: Number(this.getSecretValue("githubInstallationId")),
      });
    } else {
      await api.request("GET /octocat");
    }

    return {
      success: true,
    };
  }

  private parseIdentifier(identifier: string) {
    const [owner, name] = identifier.split("/");
    if (!owner || !name) {
      logger.warn("Invalid identifier format. Expected 'owner/name', for identifier", { identifier });
      return null;
    }
    return { owner, name };
  }

  public async getLatestMatchingReleaseAsync(identifier: string, versionRegex?: string): Promise<ReleaseResponse> {
    const parsedIdentifier = this.parseIdentifier(identifier);
    if (!parsedIdentifier) return { success: false, error: { code: "invalidIdentifier" } };

    const { owner, name } = parsedIdentifier;
    const api = this.getApi();

    try {
      const releasesResponse = await api.rest.packages.getAllPackageVersionsForPackageOwnedByUser({
        username: owner,
        package_type: "container",
        package_name: name,
        per_page: 100,
      });

      const releasesProviderResponse = releasesResponse.data.reduce<ReleaseProviderResponse[]>((acc, release) => {
        if (!release.metadata?.container?.tags || !(release.metadata.container.tags.length > 0)) return acc;

        release.metadata.container.tags.forEach((tag) => {
          acc.push({
            latestRelease: tag,
            latestReleaseAt: new Date(release.updated_at),
            releaseUrl: release.html_url,
            releaseDescription: release.description ?? undefined,
          });
        });
        return acc;
      }, []);

      const latestRelease = getLatestRelease(releasesProviderResponse, versionRegex);
      if (!latestRelease) return { success: false, error: { code: "noMatchingVersion" } };

      const details = await this.getDetailsAsync(api, owner, name);

      return { success: true, data: { ...details, ...latestRelease } };
    } catch (error) {
      const errorMessage = error instanceof RequestError ? error.message : String(error);
      logger.warn("Failed to get releases", {
        owner,
        name,
        error: errorMessage,
      });
      return { success: false, error: { code: "unexpected", message: errorMessage } };
    }
  }

  protected async getDetailsAsync(
    api: Octokit,
    owner: string,
    name: string,
  ): Promise<DetailsProviderResponse | undefined> {
    try {
      const response = await api.rest.packages.getPackageForUser({
        username: owner,
        package_type: "container",
        package_name: name,
      });

      return {
        projectUrl: response.data.repository?.html_url ?? response.data.html_url,
        projectDescription: response.data.repository?.description ?? undefined,
        isFork: response.data.repository?.fork,
        isArchived: response.data.repository?.archived,
        createdAt: new Date(response.data.created_at),
        starsCount: response.data.repository?.stargazers_count,
        openIssues: response.data.repository?.open_issues_count,
        forksCount: response.data.repository?.forks_count,
      };
    } catch (error) {
      logger.warn("Failed to get details", {
        owner,
        name,
        error: error instanceof RequestError ? error.message : String(error),
      });
      return undefined;
    }
  }

  private getAuthProperties(): Pick<OctokitOptions, "auth" | "authStrategy"> {
    if (this.hasSecretValue("personalAccessToken"))
      return {
        auth: this.getSecretValue("personalAccessToken"),
      };

    if (this.hasSecretValue("githubAppId"))
      return {
        authStrategy: createAppAuth,
        auth: {
          appId: this.getSecretValue("githubAppId"),
          installationId: this.getSecretValue("githubInstallationId"),
          privateKey: this.getSecretValue("privateKey"),
        } satisfies Parameters<typeof createAppAuth>[0],
      };

    return {};
  }

  private getApi(customFetch?: typeof fetch) {
    return new Octokit({
      baseUrl: this.url("/").origin,
      request: {
        fetch: customFetch ?? fetchWithTrustedCertificatesAsync,
      },
      userAgent: GitHubContainerRegistryIntegration.userAgent,
      // Disable throttling for this integration, Octokit will retry by default after a set time,
      // thus delaying the repsonse to the user in case of errors. Errors will be shown to the user, no need to retry the request.
      throttle: { enabled: false },
      ...this.getAuthProperties(),
    });
  }
}

type OctokitOptions = Exclude<ConstructorParameters<typeof Octokit>[0], undefined>;
