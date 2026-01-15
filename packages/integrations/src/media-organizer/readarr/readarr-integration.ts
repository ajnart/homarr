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

const logger = createLogger({ module: "readarrIntegration" });

export class ReadarrIntegration extends Integration implements ICalendarIntegration {
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
  async getCalendarEventsAsync(
    start: Date,
    end: Date,
    includeUnmonitored = true,
    includeAuthor = true,
  ): Promise<CalendarEvent[]> {
    const url = this.url("/api/v1/calendar", {
      start,
      end,
      unmonitored: includeUnmonitored,
      includeAuthor,
    });

    const response = await fetchWithTrustedCertificatesAsync(url, {
      headers: {
        "X-Api-Key": super.getSecretValue("apiKey"),
      },
    });
    const readarrCalendarEvents = await z.array(readarrCalendarEventSchema).parseAsync(await response.json());

    return readarrCalendarEvents.map((readarrCalendarEvent): CalendarEvent => {
      const imageSrc = this.chooseBestImageAsURL(readarrCalendarEvent);

      return {
        title: readarrCalendarEvent.title,
        subTitle: readarrCalendarEvent.author.authorName,
        description: readarrCalendarEvent.overview ?? null,
        startDate: readarrCalendarEvent.releaseDate,
        endDate: null,
        image: imageSrc
          ? {
              src: imageSrc,
              aspectRatio: { width: 7, height: 12 },
            }
          : null,
        location: null,
        indicatorColor: "#f5c518",
        links: this.getLinksForReadarrCalendarEvent(readarrCalendarEvent),
      };
    });
  }

  private getLinksForReadarrCalendarEvent = (event: z.infer<typeof readarrCalendarEventSchema>) => {
    return [
      {
        href: this.externalUrl(`/author/${event.author.foreignAuthorId}`).toString(),
        color: "#f5c518",
        isDark: false,
        logo: "/images/apps/readarr.svg",
        name: "Readarr",
      },
    ] satisfies CalendarLink[];
  };

  private chooseBestImage = (
    event: z.infer<typeof readarrCalendarEventSchema>,
  ): z.infer<typeof readarrCalendarEventSchema>["images"][number] | undefined => {
    const flatImages = [...event.images];

    const sortedImages = flatImages.sort(
      (imageA, imageB) =>
        mediaOrganizerPriorities.indexOf(imageA.coverType) - mediaOrganizerPriorities.indexOf(imageB.coverType),
    );
    logger.debug(`Sorted images to [${sortedImages.map((image) => image.coverType).join(",")}]`);
    return sortedImages[0];
  };

  private chooseBestImageAsURL = (event: z.infer<typeof readarrCalendarEventSchema>): string | undefined => {
    const bestImage = this.chooseBestImage(event);
    if (!bestImage) {
      return undefined;
    }
    return this.externalUrl(bestImage.url as `/${string}`).toString();
  };
}

const readarrCalendarEventImageSchema = z.array(
  z.object({
    // See https://github.com/Readarr/Readarr/blob/e5519d60c969105db2f2ab3a8f1cf61814551bb9/src/NzbDrone.Core/MediaCover/MediaCover.cs#L8-L20
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
    url: z.string().transform((url) => url.replace(/\?lastWrite=[0-9]+/, "")), // returns a random string, needs to be removed for loading the image
  }),
);

const readarrCalendarEventSchema = z.object({
  title: z.string(),
  overview: z.string().optional(),
  images: readarrCalendarEventImageSchema,
  links: z.array(
    z.object({
      name: z.string(),
      url: z.string(),
    }),
  ),
  author: z.object({
    authorName: z.string(),
    foreignAuthorId: z.string(),
  }),
  releaseDate: z.string().transform((value) => new Date(value)),
});
