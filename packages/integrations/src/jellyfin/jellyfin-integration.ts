import { Jellyfin } from "@jellyfin/sdk";
import { BaseItemKind } from "@jellyfin/sdk/lib/generated-client/models";
import { getSessionApi } from "@jellyfin/sdk/lib/utils/api/session-api";
import { getSystemApi } from "@jellyfin/sdk/lib/utils/api/system-api";
import { getUserApi } from "@jellyfin/sdk/lib/utils/api/user-api";
import { getUserLibraryApi } from "@jellyfin/sdk/lib/utils/api/user-library-api";
import type { AxiosInstance } from "axios";

import { createAxiosCertificateInstanceAsync } from "@homarr/core/infrastructure/http";

import { HandleIntegrationErrors } from "../base/errors/decorator";
import { integrationAxiosHttpErrorHandler } from "../base/errors/http";
import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IMediaServerIntegration } from "../interfaces/media-server/media-server-integration";
import type { CurrentSessionsInput, StreamSession } from "../interfaces/media-server/media-server-types";
import type { IMediaReleasesIntegration, MediaRelease, MediaType } from "../types";

@HandleIntegrationErrors([integrationAxiosHttpErrorHandler])
export class JellyfinIntegration extends Integration implements IMediaServerIntegration, IMediaReleasesIntegration {
  private readonly jellyfin: Jellyfin = new Jellyfin({
    clientInfo: {
      name: "Homarr",
      version: "0.0.1",
    },
    deviceInfo: {
      name: "Homarr",
      id: "homarr",
    },
  });

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const api = await this.getApiAsync(input.axiosInstance);
    const systemApi = getSystemApi(api);
    await systemApi.getPingSystem();
    return { success: true };
  }

  public async getCurrentSessionsAsync(options: CurrentSessionsInput): Promise<StreamSession[]> {
    const api = await this.getApiAsync();
    const sessionApi = getSessionApi(api);
    const sessions = await sessionApi.getSessions();

    return sessions.data
      .filter((sessionInfo) => sessionInfo.UserId !== undefined)
      .filter((sessionInfo) => sessionInfo.DeviceId !== "homarr")
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
            metadata: {
              video: {
                resolution:
                  sessionInfo.NowPlayingItem.Width && sessionInfo.NowPlayingItem.Height
                    ? {
                        width: sessionInfo.NowPlayingItem.Width,
                        height: sessionInfo.NowPlayingItem.Height,
                      }
                    : null,
                frameRate: sessionInfo.TranscodingInfo?.Framerate ?? null,
              },
              audio: {
                channelCount: sessionInfo.TranscodingInfo?.AudioChannels ?? null,
                codec: sessionInfo.TranscodingInfo?.AudioCodec ?? null,
              },
              transcoding: {
                resolution:
                  sessionInfo.TranscodingInfo?.Width && sessionInfo.TranscodingInfo.Height
                    ? {
                        width: sessionInfo.TranscodingInfo.Width,
                        height: sessionInfo.TranscodingInfo.Height,
                      }
                    : null,
                target: {
                  audioCodec: sessionInfo.TranscodingInfo?.AudioCodec ?? null,
                  videoCodec: sessionInfo.TranscodingInfo?.VideoCodec ?? null,
                },
                container: sessionInfo.TranscodingInfo?.Container ?? null,
              },
            },
          };
        }

        return {
          sessionId: `${sessionInfo.Id}`,
          sessionName: `${sessionInfo.Client} (${sessionInfo.DeviceName})`,
          user: {
            profilePictureUrl: this.externalUrl(`/Users/${sessionInfo.UserId}/Images/Primary`).toString(),
            userId: sessionInfo.UserId ?? "",
            username: sessionInfo.UserName ?? "",
          },
          currentlyPlaying,
        };
      });
  }

  public async getMediaReleasesAsync(): Promise<MediaRelease[]> {
    const apiClient = await this.getApiAsync();
    const userLibraryApi = getUserLibraryApi(apiClient);
    const userApi = getUserApi(apiClient);

    const users = await userApi.getUsers();
    const userId = users.data.at(0)?.Id;
    if (!userId) {
      throw new Error("No users found");
    }

    const result = await userLibraryApi.getLatestMedia({
      fields: ["CustomRating", "Studios", "Genres", "ChildCount", "DateCreated", "Overview", "Taglines"],
      userId,
      limit: 100,
    });
    return result.data.map((item) => ({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: item.Id!,
      type: this.mapMediaReleaseType(item.Type),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      title: item.Name!,
      subtitle: item.Taglines?.at(0),
      description: item.Overview ?? undefined,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      releaseDate: new Date(item.PremiereDate ?? item.DateCreated!),
      imageUrls: {
        poster: super.externalUrl(`/Items/${item.Id}/Images/Primary?maxHeight=492&maxWidth=328&quality=90`).toString(),
        backdrop: super.externalUrl(`/Items/${item.Id}/Images/Backdrop/0?maxWidth=960&quality=70`).toString(),
      },
      producer: item.Studios?.at(0)?.Name ?? undefined,
      rating: item.CommunityRating?.toFixed(1),
      tags: item.Genres ?? [],
      href: super.externalUrl(`/web/index.html#!/details?id=${item.Id}&serverId=${item.ServerId}`).toString(),
    }));
  }

  private mapMediaReleaseType(type: BaseItemKind | undefined): MediaType {
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

  /**
   * Constructs an ApiClient synchronously with an ApiKey or asynchronously
   * with a username and password.
   * @returns An instance of Api that has been authenticated
   */
  private async getApiAsync(fallbackInstance?: AxiosInstance) {
    const axiosInstance = fallbackInstance ?? (await createAxiosCertificateInstanceAsync());
    if (this.hasSecretValue("apiKey")) {
      const apiKey = this.getSecretValue("apiKey");
      return this.jellyfin.createApi(this.url("/").toString(), apiKey, axiosInstance);
    }

    const apiClient = this.jellyfin.createApi(this.url("/").toString(), undefined, axiosInstance);
    // Authentication state is stored internally in the Api class, so now
    // requests that require authentication can be made normally.
    // see https://typescript-sdk.jellyfin.org/#usage
    await apiClient.authenticateUserByName(this.getSecretValue("username"), this.getSecretValue("password"));
    return apiClient;
  }
}

export const convertJellyfinType = (
  kind: BaseItemKind | undefined,
): Exclude<StreamSession["currentlyPlaying"], null>["type"] => {
  switch (kind) {
    case BaseItemKind.Audio:
    case BaseItemKind.MusicVideo:
      return "audio";
    case BaseItemKind.Episode:
    case BaseItemKind.Video:
      return "video";
    case BaseItemKind.Movie:
      return "movie";
    case BaseItemKind.TvChannel:
    case BaseItemKind.TvProgram:
    case BaseItemKind.LiveTvChannel:
    case BaseItemKind.LiveTvProgram:
    default:
      return "tv";
  }
};
