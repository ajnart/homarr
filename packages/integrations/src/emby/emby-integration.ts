import { BaseItemKind } from "@jellyfin/sdk/lib/generated-client/models";
import { z } from "zod/v4";

import { ResponseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IMediaServerIntegration } from "../interfaces/media-server/media-server-integration";
import type { CurrentSessionsInput, StreamSession } from "../interfaces/media-server/media-server-types";
import { convertJellyfinType } from "../jellyfin/jellyfin-integration";
import type { IMediaReleasesIntegration, MediaRelease, MediaType } from "../types";

const sessionSchema = z.object({
  NowPlayingItem: z
    .object({
      Type: z.nativeEnum(BaseItemKind).optional(),
      SeriesName: z.string().nullish(),
      Name: z.string().nullish(),
      SeasonName: z.string().nullish(),
      EpisodeTitle: z.string().nullish(),
      Album: z.string().nullish(),
      EpisodeCount: z.number().nullish(),
    })
    .optional(),
  Id: z.string(),
  Client: z.string().nullish(),
  DeviceId: z.string().nullish(),
  DeviceName: z.string().nullish(),
  UserId: z.string().optional(),
  UserName: z.string().nullish(),
});

const itemSchema = z.object({
  Id: z.string(),
  ServerId: z.string(),
  Name: z.string(),
  Taglines: z.array(z.string()),
  Studios: z.array(z.object({ Name: z.string() })),
  Overview: z.string().optional(),
  PremiereDate: z
    .string()
    .datetime()
    .transform((date) => new Date(date))
    .optional(),
  DateCreated: z
    .string()
    .datetime()
    .transform((date) => new Date(date)),
  Genres: z.array(z.string()),
  CommunityRating: z.number().optional(),
  RunTimeTicks: z.number(),
  Type: z.string(), // for example "Movie"
});

const userSchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export class EmbyIntegration extends Integration implements IMediaServerIntegration, IMediaReleasesIntegration {
  private static readonly apiKeyHeader = "X-Emby-Token";
  private static readonly deviceId = "homarr-emby-integration";
  private static readonly authorizationHeaderValue = `Emby Client="Dashboard", Device="Homarr", DeviceId="${EmbyIntegration.deviceId}", Version="0.0.1"`;

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await input.fetchAsync(super.url("/emby/System/Ping"), {
      headers: {
        [EmbyIntegration.apiKeyHeader]: apiKey,
        Authorization: EmbyIntegration.authorizationHeaderValue,
      },
    });

    if (!response.ok) {
      return TestConnectionError.StatusResult(response);
    }

    return {
      success: true,
    };
  }

  public async getCurrentSessionsAsync(options: CurrentSessionsInput): Promise<StreamSession[]> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(super.url("/emby/Sessions"), {
      headers: {
        [EmbyIntegration.apiKeyHeader]: apiKey,
        Authorization: EmbyIntegration.authorizationHeaderValue,
      },
    });

    if (!response.ok) {
      throw new Error(`Emby server ${this.integration.id} returned a non successful status code: ${response.status}`);
    }

    const result = z.array(sessionSchema).safeParse(await response.json());

    if (!result.success) {
      throw new Error(`Emby server ${this.integration.id} returned an unexpected response: ${result.error.message}`);
    }

    return result.data
      .filter((sessionInfo) => sessionInfo.UserId !== undefined)
      .filter((sessionInfo) => sessionInfo.DeviceId !== EmbyIntegration.deviceId)
      .filter((sessionInfo) => !options.showOnlyPlaying || sessionInfo.NowPlayingItem !== undefined)
      .map((sessionInfo): StreamSession => {
        let currentlyPlaying: StreamSession["currentlyPlaying"] | null = null;

        if (sessionInfo.NowPlayingItem) {
          currentlyPlaying = {
            type: convertJellyfinType(sessionInfo.NowPlayingItem.Type),
            name: sessionInfo.NowPlayingItem.SeriesName ?? sessionInfo.NowPlayingItem.Name ?? "",
            seasonName: sessionInfo.NowPlayingItem.SeasonName ?? "",
            episodeName: sessionInfo.NowPlayingItem.EpisodeTitle,
            albumName: sessionInfo.NowPlayingItem.Album ?? "",
            episodeCount: sessionInfo.NowPlayingItem.EpisodeCount,
            metadata: null,
          };
        }

        return {
          sessionId: `${sessionInfo.Id}`,
          sessionName: `${sessionInfo.Client} (${sessionInfo.DeviceName})`,
          user: {
            profilePictureUrl: super.externalUrl(`/Users/${sessionInfo.UserId}/Images/Primary`).toString(),
            userId: sessionInfo.UserId ?? "",
            username: sessionInfo.UserName ?? "",
          },
          currentlyPlaying,
        };
      });
  }

  public async getMediaReleasesAsync(): Promise<MediaRelease[]> {
    const limit = 100;
    const users = await this.fetchUsersPublicAsync();
    const userId = users.at(0)?.id;
    if (!userId) {
      throw new Error("No users found");
    }

    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(
      super.url(
        `/Users/${userId}/Items/Latest?Limit=${limit}&Fields=CommunityRating,Studios,PremiereDate,Genres,ChildCount,ProductionYear,DateCreated,Overview,Taglines`,
      ),
      {
        headers: {
          [EmbyIntegration.apiKeyHeader]: apiKey,
          Authorization: EmbyIntegration.authorizationHeaderValue,
        },
      },
    );

    if (!response.ok) {
      throw new ResponseError(response);
    }

    const items = z.array(itemSchema).parse(await response.json());

    return items.map((item) => ({
      id: item.Id,
      type: this.mapMediaReleaseType(item.Type),
      title: item.Name,
      subtitle: item.Taglines.at(0),
      description: item.Overview,
      releaseDate: item.PremiereDate ?? item.DateCreated,
      imageUrls: {
        poster: super.externalUrl(`/Items/${item.Id}/Images/Primary?maxHeight=492&maxWidth=328&quality=90`).toString(),
        backdrop: super.externalUrl(`/Items/${item.Id}/Images/Backdrop/0?maxWidth=960&quality=70`).toString(),
      },
      producer: item.Studios.at(0)?.Name,
      rating: item.CommunityRating?.toFixed(1),
      tags: item.Genres,
      href: super.externalUrl(`/web/index.html#!/item?id=${item.Id}&serverId=${item.ServerId}`).toString(),
    }));
  }

  private mapMediaReleaseType(type: string | undefined): MediaType {
    switch (type) {
      case "Audio":
      case "AudioBook":
      case "MusicAlbum":
        return "music";
      case "Book":
        return "book";
      case "Episode":
      case "Series":
      case "Season":
        return "tv";
      case "Movie":
        return "movie";
      case "Video":
        return "video";
      default:
        return "unknown";
    }
  }

  // https://dev.emby.media/reference/RestAPI/UserService/getUsersPublic.html
  private async fetchUsersPublicAsync(): Promise<{ id: string; name: string }[]> {
    const apiKey = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(super.url("/Users/Public"), {
      headers: {
        [EmbyIntegration.apiKeyHeader]: apiKey,
        Authorization: EmbyIntegration.authorizationHeaderValue,
      },
    });
    if (!response.ok) {
      throw new ResponseError(response);
    }
    const users = z.array(userSchema).parse(await response.json());

    return users.map((user) => ({
      id: user.Id,
      name: user.Name,
    }));
  }
}
