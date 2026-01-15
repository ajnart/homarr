import { parseStringPromise } from "xml2js";
import { z } from "zod/v4";

import { ParseError } from "@homarr/common/server";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ImageProxy } from "@homarr/image-proxy";

import type { IntegrationTestingInput } from "../base/integration";
import { Integration } from "../base/integration";
import { TestConnectionError } from "../base/test-connection/test-connection-error";
import type { TestingResult } from "../base/test-connection/test-connection-service";
import type { IMediaServerIntegration } from "../interfaces/media-server/media-server-integration";
import type { CurrentSessionsInput, StreamSession } from "../interfaces/media-server/media-server-types";
import type { IMediaReleasesIntegration, MediaRelease } from "../types";
import type { PlexResponse } from "./interface";

const logger = createLogger({ module: "plexIntegration" });

export class PlexIntegration extends Integration implements IMediaServerIntegration, IMediaReleasesIntegration {
  public async getCurrentSessionsAsync(_options: CurrentSessionsInput): Promise<StreamSession[]> {
    const token = super.getSecretValue("apiKey");

    const response = await fetchWithTrustedCertificatesAsync(this.url("/status/sessions"), {
      headers: {
        "X-Plex-Token": token,
      },
    });
    const body = await response.text();
    // convert xml response to objects, as there is no JSON api
    const data = await PlexIntegration.parseXmlAsync<PlexResponse>(body);
    const mediaContainer = data.MediaContainer;
    const mediaElements = [mediaContainer.Video ?? [], mediaContainer.Track ?? []].flat();

    // no sessions are open or available
    if (mediaElements.length === 0) {
      logger.info("No active video sessions found in MediaContainer");
      return [];
    }

    const medias = mediaElements
      .map((mediaElement): StreamSession | undefined => {
        const userElement = mediaElement.User ? mediaElement.User[0] : undefined;
        const playerElement = mediaElement.Player ? mediaElement.Player[0] : undefined;
        const sessionElement = mediaElement.Session ? mediaElement.Session[0] : undefined;

        if (!playerElement) {
          return undefined;
        }

        return {
          sessionId: sessionElement?.$.id ?? "unknown",
          sessionName: `${playerElement.$.product} (${playerElement.$.title})`,
          user: {
            userId: userElement?.$.id ?? "Anonymous",
            username: userElement?.$.title ?? "Anonymous",
            profilePictureUrl: userElement?.$.thumb ?? null,
          },
          currentlyPlaying: {
            type: mediaElement.$.live === "1" ? "tv" : PlexIntegration.getCurrentlyPlayingType(mediaElement.$.type),
            name: mediaElement.$.grandparentTitle ?? mediaElement.$.title ?? "Unknown",
            seasonName: mediaElement.$.parentTitle,
            episodeName: mediaElement.$.title ?? null,
            albumName: mediaElement.$.type === "track" ? (mediaElement.$.parentTitle ?? null) : null,
            episodeCount: mediaElement.$.index ?? null,
            metadata: null,
          },
        };
      })
      .filter((session): session is StreamSession => session !== undefined);

    return medias;
  }

  public async getMediaReleasesAsync(): Promise<MediaRelease[]> {
    const token = super.getSecretValue("apiKey");
    const machineIdentifier = await this.getMachineIdentifierAsync();
    const response = await fetchWithTrustedCertificatesAsync(super.url("/library/recentlyAdded"), {
      headers: {
        "X-Plex-Token": token,
        Accept: "application/json",
      },
    });

    const json = await response.json();
    const data = await recentlyAddedSchema.parseAsync(json);
    const imageProxy = new ImageProxy();

    const images =
      data.MediaContainer.Metadata?.filter((item) => item.Image)
        .flatMap((item) => [
          {
            mediaKey: item.key,
            type: "poster",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            url: item.Image!.find((image) => image?.type === "coverPoster")?.url,
          },
          {
            mediaKey: item.key,
            type: "backdrop",
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            url: item.Image!.find((image) => image?.type === "background")?.url,
          },
        ])
        .filter(
          (image): image is { mediaKey: string; type: "poster" | "backdrop"; url: string } => image.url !== undefined,
        ) ?? [];

    const proxiedImages = await Promise.all(
      images.map(async (image) => {
        const imageUrl = super.url(image.url as `/${string}`);
        const proxiedImageUrl = await imageProxy
          .createImageAsync(imageUrl.toString(), {
            "X-Plex-Token": token,
          })
          .catch((error) => {
            logger.debug(new Error("Failed to proxy image", { cause: error }));
            return undefined;
          });
        return {
          mediaKey: image.mediaKey,
          type: image.type,
          url: proxiedImageUrl,
        };
      }),
    );

    const media =
      data.MediaContainer.Metadata?.filter((item) => item.Image).map((item) => {
        return {
          id: item.Media?.at(0)?.id.toString() ?? item.key,
          type: mapType(item.type),
          title: item.title,
          subtitle: item.tagline,
          description: item.summary,
          releaseDate: item.originallyAvailableAt
            ? new Date(item.originallyAvailableAt)
            : new Date(item.addedAt * 1000),
          imageUrls: {
            poster: proxiedImages.find((image) => image.mediaKey === item.key && image.type === "poster")?.url,
            backdrop: proxiedImages.find((image) => image.mediaKey === item.key && image.type === "backdrop")?.url,
          },
          producer: item.studio,
          rating: item.rating?.toFixed(1),
          tags: item.Genre?.map((genre) => genre.tag) ?? [],
          href: super
            .url(
              // Url with children on the end results in infinite loading screen, see https://github.com/homarr-labs/homarr/issues/4078
              `/web/index.html#!/server/${machineIdentifier}/details?key=${encodeURIComponent(item.key.replace("/children", ""))}`,
            )
            .toString(),
          length: item.duration ? Math.round(item.duration / 1000) : undefined,
        };
      }) ?? [];

    return media;
  }

  private async getMachineIdentifierAsync(): Promise<string> {
    const token = super.getSecretValue("apiKey");
    const response = await fetchWithTrustedCertificatesAsync(super.url("/identity"), {
      headers: {
        "X-Plex-Token": token,
        Accept: "application/json",
      },
    });
    const data = await identitySchema.parseAsync(await response.json());
    return data.MediaContainer.machineIdentifier;
  }

  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const token = super.getSecretValue("apiKey");

    const response = await input.fetchAsync(super.url("/prefs"), {
      headers: {
        "X-Plex-Token": token,
        Accept: "application/json",
      },
    });

    if (!response.ok) return TestConnectionError.StatusResult(response);

    return { success: true };
  }

  static async parseXmlAsync<T>(xml: string): Promise<T> {
    try {
      return (await parseStringPromise(xml)) as Promise<T>;
    } catch (error) {
      throw new ParseError(
        "Invalid xml format",
        error instanceof Error
          ? {
              cause: error,
            }
          : undefined,
      );
    }
  }

  static getCurrentlyPlayingType(type: string): NonNullable<StreamSession["currentlyPlaying"]>["type"] {
    switch (type) {
      case "movie":
        return "movie";
      case "episode":
        return "video";
      case "track":
        return "audio";
      default:
        return "video";
    }
  }
}

// https://plexapi.dev/api-reference/library/get-recently-added
const recentlyAddedSchema = z.object({
  MediaContainer: z.object({
    Metadata: z
      .array(
        z.object({
          key: z.string(),
          studio: z.string().optional(),
          type: z.string(), // For example "movie", "album"
          title: z.string(),
          summary: z.string().optional(),
          duration: z.number().optional(),
          addedAt: z.number(),
          rating: z.number().optional(),
          tagline: z.string().optional(),
          originallyAvailableAt: z.string().optional(),
          Media: z
            .array(
              z.object({
                id: z.number(),
              }),
            )
            .optional(),
          Image: z
            .array(
              z
                .object({
                  type: z.string(), // for example "coverPoster" or "background"
                  url: z.string(),
                })
                .optional(),
            )
            .optional(),
          Genre: z
            .array(
              z.object({
                tag: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
  }),
});

// https://plexapi.dev/api-reference/server/get-server-identity
const identitySchema = z.object({
  MediaContainer: z.object({
    machineIdentifier: z.string(),
  }),
});

const mapType = (type: string): "movie" | "tv" | "unknown" => {
  switch (type) {
    case "movie":
      return "movie";
    case "show":
    case "season":
    case "episode":
      return "tv";
    default:
      return "unknown";
  }
};
