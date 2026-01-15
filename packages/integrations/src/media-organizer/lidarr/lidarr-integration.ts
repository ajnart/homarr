import { z } from "zod/v4";

import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { Integration } from "../../base/integration";
import type { IntegrationTestingInput } from "../../base/integration";
import { TestConnectionError } from "../../base/test-connection/test-connection-error";
import type { TestingResult } from "../../base/test-connection/test-connection-service";
import type { ICalendarIntegration } from "../../interfaces/calendar/calendar-integration";
import type { CalendarEvent, CalendarLink } from "../../interfaces/calendar/calendar-types";
import { mediaOrganizerPriorities } from "../media-organizer";

const logger = createLogger({ module: "lidarrIntegration" });

export class LidarrIntegration extends Integration implements ICalendarIntegration {
  protected async testingAsync(input: IntegrationTestingInput): Promise<TestingResult> {
    const response = await input.fetchAsync(this.url("/api"), {
      headers: { "X-Api-Key": super.getSecretValue("apiKey") },
    });

    if (!response.ok) return TestConnectionError.StatusResult(response);

    await response.json();
    return { success: true };
  }

  /**
   * Gets the events in the Lidarr calendar between two dates.
   * @param start The start date
   * @param end The end date
   * @param includeUnmonitored When true results will include unmonitored items of the Tadarr library.
   */
  async getCalendarEventsAsync(start: Date, end: Date, includeUnmonitored = true): Promise<CalendarEvent[]> {
    const url = this.url("/api/v1/calendar", {
      start,
      end,
      unmonitored: includeUnmonitored,
    });

    const response = await fetchWithTrustedCertificatesAsync(url, {
      headers: {
        "X-Api-Key": super.getSecretValue("apiKey"),
      },
    });
    const lidarrCalendarEvents = await z.array(lidarrCalendarEventSchema).parseAsync(await response.json());

    return lidarrCalendarEvents.map((lidarrCalendarEvent): CalendarEvent => {
      const imageSrc = this.chooseBestImage(lidarrCalendarEvent);
      return {
        title: lidarrCalendarEvent.title,
        subTitle: lidarrCalendarEvent.artist.artistName,
        description: lidarrCalendarEvent.overview ?? null,
        startDate: lidarrCalendarEvent.releaseDate,
        endDate: null,
        image: imageSrc
          ? {
              src: imageSrc.remoteUrl,
              aspectRatio: { width: 7, height: 12 },
            }
          : null,
        location: null,
        indicatorColor: "cyan",
        links: this.getLinksForLidarrCalendarEvent(lidarrCalendarEvent),
      };
    });
  }

  private getLinksForLidarrCalendarEvent = (event: z.infer<typeof lidarrCalendarEventSchema>) => {
    const links: CalendarLink[] = [];

    for (const link of event.artist.links) {
      switch (link.name) {
        case "vgmdb":
          links.push({
            href: link.url,
            name: "VgmDB",
            color: "#f5c518",
            isDark: false,
            logo: "/images/apps/vgmdb.svg",
          });
          break;
        case "imdb":
          links.push({
            href: link.url,
            name: "IMDb",
            color: "#f5c518",
            isDark: false,
            logo: "/images/apps/imdb.png",
          });
          break;
        case "last":
          links.push({
            href: link.url,
            name: "LastFM",
            color: "#cf222a",
            isDark: false,
            logo: "/images/apps/lastfm.svg",
          });
          break;
      }
    }

    return links;
  };

  private chooseBestImage = (
    event: z.infer<typeof lidarrCalendarEventSchema>,
  ): z.infer<typeof lidarrCalendarEventSchema>["images"][number] | undefined => {
    const flatImages = [...event.images];

    const sortedImages = flatImages.sort(
      (imageA, imageB) =>
        mediaOrganizerPriorities.indexOf(imageA.coverType) - mediaOrganizerPriorities.indexOf(imageB.coverType),
    );
    logger.debug(`Sorted images to [${sortedImages.map((image) => image.coverType).join(",")}]`);
    return sortedImages[0];
  };

  private chooseBestImageAsURL = (event: z.infer<typeof lidarrCalendarEventSchema>): string | undefined => {
    const bestImage = this.chooseBestImage(event);
    if (!bestImage) {
      return undefined;
    }
    return bestImage.remoteUrl;
  };
}

const lidarrCalendarEventImageSchema = z.array(
  z.object({
    // See https://github.com/Lidarr/Lidarr/blob/bc6417229e9da3d3cab418f92b46eec7a76168c2/src/NzbDrone.Core/MediaCover/MediaCover.cs#L8-L20
    coverType: z.enum([
      "unknown",
      "poster",
      "banner",
      "fanart",
      "screenshot",
      "headshot",
      "cover",
      "disc",
      "logo",
      "clearlogo",
    ]),
    remoteUrl: z.string().url(),
  }),
);

const lidarrCalendarEventSchema = z.object({
  title: z.string(),
  overview: z.string().optional(),
  images: lidarrCalendarEventImageSchema,
  artist: z.object({ links: z.array(z.object({ url: z.string().url(), name: z.string() })), artistName: z.string() }),
  releaseDate: z.string().transform((value) => new Date(value)),
});
