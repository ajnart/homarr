import { z } from "zod/v4";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { ISearchableIntegration } from "../base/searchable-integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IMediaRequestIntegration } from "../interfaces/media-requests/media-request-integration";
import type {
  MediaAvailability,
  MediaRequest,
  MediaRequestStatus,
  RequestStats,
  RequestUser,
} from "../interfaces/media-requests/media-request-types";
import {
  UpstreamMediaAvailability,
  UpstreamMediaRequestStatus,
} from "../interfaces/media-requests/media-request-types";

const logger = createLogger({ module: "overseerrIntegration" });

interface OverseerrSearchResult {
  id: number;
  name: string;
  link: string;
  image?: string;
  text?: string;
  type: Exclude<z.infer<typeof searchSchema>["results"], undefined>[number]["mediaType"];
}

/**
 * Overseerr Integration. See https://api-docs.overseerr.dev
 */
export class OverseerrIntegration
  extends Integration
  implements IMediaRequestIntegration, ISearchableIntegration<OverseerrSearchResult>
{
  public async searchAsync(query: string) {
    const response = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/search", { query }), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });
    const schemaData = await searchSchema.parseAsync(await response.json());

    if (!schemaData.results) {
      return [];
    }

    return schemaData.results.map((result) => ({
      id: result.id,
      name: "name" in result ? result.name : result.title,
      link: this.externalUrl(`/${result.mediaType}/${result.id}`).toString(),
      image: constructSearchResultImage(result),
      text: "overview" in result ? result.overview : undefined,
      type: result.mediaType,
      inLibrary: result.mediaInfo !== undefined,
    }));
  }

  public async getSeriesInformationAsync(mediaType: "movie" | "tv", id: number) {
    const url = mediaType === "tv" ? this.url(`/api/v1/tv/${id}`) : this.url(`/api/v1/movie/${id}`);
    const response = await fetchWithTrustedCertificatesAsync(url, {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });
    return await mediaInformationSchema.parseAsync(await response.json());
  }

  /**
   * Request a media. See https://api-docs.overseerr.dev/#/request/post_request
   * @param mediaType The media type to request. Can be "movie" or "tv".
   * @param id The Overseerr ID of the media to request.
   * @param seasons A list of the seasons that should be requested.
   */
  public async requestMediaAsync(mediaType: "movie" | "tv", id: number, seasons?: number[]): Promise<void> {
    const url = this.url("/api/v1/request");
    const response = await fetchWithTrustedCertificatesAsync(url, {
      method: "POST",
      body: JSON.stringify({
        mediaType,
        mediaId: id,
        seasons,
      }),
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
        "Content-Type": "application/json",
      },
    });
    if (response.status !== 201) {
      throw new Error(
        `Status code ${response.status} does not match the expected status code. The request was likely not created. Response: ${await response.text()}`,
      );
    }
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api/v1/auth/me"), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });

    if (!response.ok) return TestConnectionError.StatusResult(response);

    const responseSchema = z.object({ id: z.number() });
    await responseSchema.parseAsync(await response.json());
    return { success: true };
  }

  public async getRequestsAsync(): Promise<MediaRequest[]> {
    //Ensure to get all pending request first
    const pendingRequests = await fetchWithTrustedCertificatesAsync(
      this.url("/api/v1/request", { take: -1, filter: "pending" }),
      {
        headers: {
          "X-Api-Key": this.getSecretValue("apiKey"),
        },
      },
    );

    //Change 20 to integration setting (set to -1 for all)
    const allRequests = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/request", { take: 20 }), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });

    const pendingResults = (await getRequestsSchema.parseAsync(await pendingRequests.json())).results;
    const allResults = (await getRequestsSchema.parseAsync(await allRequests.json())).results;

    //Concat the 2 lists while remove any duplicate pending from the all items list
    let requests;

    if (pendingResults.length > 0 && allResults.length > 0) {
      requests = pendingResults.concat(
        allResults.filter(({ status }) => status !== UpstreamMediaRequestStatus.PendingApproval),
      );
    } else if (pendingResults.length > 0) requests = pendingResults;
    else if (allResults.length > 0) requests = allResults;
    else return Promise.all([]);

    return await Promise.all(
      requests.map(async (request): Promise<MediaRequest> => {
        const information = await this.getItemInformationAsync(request.media.tmdbId, request.type);

        // See https://github.com/seerr-team/seerr/blob/af083a3cd5c3e3d5d7917fdf4fdd67fe3f39c46b/src/components/StatusBadge/index.tsx#L40
        const inProgress = (request.media.downloadStatus ?? []).length >= 1;

        return {
          id: request.id,
          name: information.name,
          status: this.mapRequestStatus(request.status),
          availability: this.mapAvailability(request.media.status, inProgress),
          backdropImageUrl: `https://image.tmdb.org/t/p/original/${information.backdropPath}`,
          posterImagePath: `https://image.tmdb.org/t/p/w600_and_h900_bestv2/${information.posterPath}`,
          href: this.externalUrl(`/${request.type}/${request.media.tmdbId}`).toString(),
          type: request.type,
          createdAt: request.createdAt,
          airDate: new Date(information.airDate),
          requestedBy: request.requestedBy
            ? ({
                ...request.requestedBy,
                displayName: request.requestedBy.displayName,
                link: this.externalUrl(`/users/${request.requestedBy.id}`).toString(),
                avatar: this.constructAvatarUrl(request.requestedBy.avatar).toString(),
              } satisfies Omit<RequestUser, "requestCount">)
            : undefined,
        };
      }),
    );
  }

  protected mapRequestStatus(status: UpstreamMediaRequestStatus): MediaRequestStatus {
    switch (status) {
      case UpstreamMediaRequestStatus.PendingApproval:
        return "pending";
      case UpstreamMediaRequestStatus.Approved:
        return "approved";
      case UpstreamMediaRequestStatus.Declined:
        return "declined";
      case UpstreamMediaRequestStatus.Failed:
        return "failed";
      case UpstreamMediaRequestStatus.Completed:
        return "completed";
      default:
        return "failed";
    }
  }

  // See https://github.com/seerr-team/seerr/blob/af083a3cd5c3e3d5d7917fdf4fdd67fe3f39c46b/src/components/StatusBadge/index.tsx#L153-L387
  protected mapAvailability(availability: UpstreamMediaAvailability, inProgress: boolean): MediaAvailability {
    switch (availability) {
      case UpstreamMediaAvailability.Available:
        return inProgress ? "processing" : "available";
      case UpstreamMediaAvailability.PartiallyAvailable:
        return inProgress ? "processing" : "partiallyAvailable";
      case UpstreamMediaAvailability.Processing:
        return inProgress ? "processing" : "requested";
      case UpstreamMediaAvailability.Pending:
        return "pending";
      case UpstreamMediaAvailability.JellyseerrBlacklistedOrOverseerrDeleted:
        return "deleted";
      case UpstreamMediaAvailability.Unknown:
      default:
        return inProgress ? "processing" : "unknown";
    }
  }

  public async getStatsAsync(): Promise<RequestStats> {
    const response = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/request/count"), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });
    return await getStatsSchema.parseAsync(await response.json());
  }

  public async getUsersAsync(): Promise<RequestUser[]> {
    const response = await fetchWithTrustedCertificatesAsync(this.url("/api/v1/user", { take: -1 }), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });
    const users = (await getUsersSchema.parseAsync(await response.json())).results;
    return users.map((user): RequestUser => {
      return {
        ...user,
        link: this.externalUrl(`/users/${user.id}`).toString(),
        avatar: this.constructAvatarUrl(user.avatar).toString(),
      };
    });
  }

  public async approveRequestAsync(requestId: number): Promise<void> {
    logger.info("Approving media request", { requestId, integration: this.integration.name });
    await fetchWithTrustedCertificatesAsync(this.url(`/api/v1/request/${requestId}/approve`), {
      method: "POST",
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    }).then((response) => {
      if (!response.ok) {
        logger.error(
          new ErrorWithMetadata("Failed to approve media request", {
            requestId,
            integration: this.integration.name,
            reason: `${response.status} ${response.statusText}`,
            url: response.url,
          }),
        );
      }

      logger.info("Successfully approved media request", { requestId, integration: this.integration.name });
    });
  }

  public async declineRequestAsync(requestId: number): Promise<void> {
    logger.info("Declining media request", { requestId, integration: this.integration.name });

    await fetchWithTrustedCertificatesAsync(this.url(`/api/v1/request/${requestId}/decline`), {
      method: "POST",
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    }).then((response) => {
      if (!response.ok) {
        logger.error(
          new ErrorWithMetadata("Failed to decline media request", {
            requestId,
            integration: this.integration.name,
            reason: `${response.status} ${response.statusText}`,
            url: response.url,
          }),
        );
      }

      logger.info("Successfully declined media request", { requestId, integration: this.integration.name });
    });
  }

  private async getItemInformationAsync(id: number, type: MediaRequest["type"]): Promise<MediaInformation> {
    const response = await fetchWithTrustedCertificatesAsync(this.url(`/api/v1/${type}/${id}`), {
      headers: {
        "X-Api-Key": this.getSecretValue("apiKey"),
      },
    });

    if (type === "tv") {
      const series = (await response.json()) as TvInformation;
      return {
        name: series.name,
        backdropPath: series.backdropPath ?? series.posterPath,
        posterPath: series.posterPath ?? series.backdropPath,
        airDate: series.firstAirDate,
      } satisfies MediaInformation;
    }

    const movie = (await response.json()) as MovieInformation;
    return {
      name: movie.title,
      backdropPath: movie.backdropPath ?? movie.posterPath,
      posterPath: movie.posterPath ?? movie.backdropPath,
      airDate: movie.releaseDate,
    } satisfies MediaInformation;
  }

  private constructAvatarUrl(avatar: string) {
    const isAbsolute = avatar.startsWith("http://") || avatar.startsWith("https://");

    if (isAbsolute) {
      return avatar;
    }

    return this.externalUrl(`/${avatar}`);
  }
}

interface MediaInformation {
  name: string;
  backdropPath?: string;
  posterPath?: string;
  airDate: string;
}

interface TvInformation {
  name: string;
  backdropPath?: string;
  posterPath?: string;
  firstAirDate: string;
}

interface MovieInformation {
  title: string;
  backdropPath?: string;
  posterPath?: string;
  releaseDate: string;
}

const mediaInformationSchema = z.union([
  z.object({
    id: z.number(),
    overview: z.string(),
    seasons: z.array(
      z.object({
        id: z.number(),
        seasonNumber: z.number(),
        name: z.string().min(0),
        episodeCount: z.number().min(0),
      }),
    ),
    numberOfSeasons: z.number(),
    posterPath: z.string().startsWith("/"),
  }),
  z.object({
    id: z.number(),
    overview: z.string(),
    posterPath: z.string().startsWith("/"),
  }),
]);

const searchSchema = z.object({
  results: z
    .array(
      z.discriminatedUnion("mediaType", [
        z.object({
          id: z.number(),
          mediaType: z.literal("tv"),
          name: z.string(),
          posterPath: z.string().startsWith("/").endsWith(".jpg").nullable(),
          overview: z.string(),
          mediaInfo: z.object({}).optional(),
        }),
        z.object({
          id: z.number(),
          mediaType: z.literal("movie"),
          title: z.string(),
          posterPath: z.string().startsWith("/").endsWith(".jpg").nullable(),
          overview: z.string(),
          mediaInfo: z.object({}).optional(),
        }),
        z.object({
          id: z.number(),
          mediaType: z.literal("person"),
          name: z.string(),
          profilePath: z.string().startsWith("/").endsWith(".jpg").nullable(),
          mediaInfo: z.object({}).optional(),
        }),
      ]),
    )
    .optional(),
});

const getRequestsSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        status: z.enum(UpstreamMediaRequestStatus),
        createdAt: z.string().transform((value) => new Date(value)),
        media: z.object({
          status: z.enum(UpstreamMediaAvailability),
          tmdbId: z.number(),
          downloadStatus: z.array(z.unknown()).optional(),
        }),
        type: z.enum(["movie", "tv"]),
        requestedBy: z
          .object({
            id: z.number(),
            displayName: z.string(),
            avatar: z.string(),
          })
          .optional(),
      }),
    )
    .optional()
    .transform((val) => {
      if (!val) {
        return [];
      }
      return val;
    }),
});

const getStatsSchema = z.object({
  total: z.number(),
  movie: z.number(),
  tv: z.number(),
  pending: z.number(),
  approved: z.number(),
  declined: z.number(),
  processing: z.number(),
  available: z.number(),
});

const getUsersSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        displayName: z.string(),
        avatar: z.string(),
        requestCount: z.number(),
      }),
    )
    .optional()
    .transform((val) => {
      if (!val) {
        return [];
      }
      return val;
    }),
});

const constructSearchResultImage = (result: Exclude<z.infer<typeof searchSchema>["results"], undefined>[number]) => {
  const path = getResultImagePath(result);
  if (!path) {
    return undefined;
  }

  return `https://image.tmdb.org/t/p/w600_and_h900_bestv2${path}`;
};

const getResultImagePath = (result: Exclude<z.infer<typeof searchSchema>["results"], undefined>[number]) => {
  switch (result.mediaType) {
    case "person":
      return result.profilePath;
    case "tv":
    case "movie":
      return result.posterPath;
    default:
      throw new Error(
        `Unable to get search result image from media type '${(result as { mediaType: string }).mediaType}'`,
      );
  }
};
