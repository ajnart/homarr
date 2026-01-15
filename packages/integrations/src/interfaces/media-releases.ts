import type { MantineColor } from "@mantine/core";

export const mediaTypeConfigurations = {
  movie: {
    color: "blue",
  },
  tv: {
    color: "violet",
  },
  music: {
    color: "green",
  },
  book: {
    color: "orange",
  },
  game: {
    color: "yellow",
  },
  video: {
    color: "red",
  },
  article: {
    color: "pink",
  },
  unknown: {
    color: "gray",
  },
} satisfies Record<string, { color: MantineColor }>;

export type MediaType = keyof typeof mediaTypeConfigurations;

export interface MediaRelease {
  id: string;
  type: MediaType;
  title: string;
  /**
   * The subtitle of the media item, if applicable.
   * Can also contain the season number for TV shows.
   */
  subtitle?: string;
  description?: string;
  releaseDate: Date;
  imageUrls: {
    poster: string | undefined;
    backdrop: string | undefined;
  };
  /**
   * The name of the studio, publisher or author.
   */
  producer?: string;
  /**
   * Price in USD
   */
  price?: number;
  /**
   * Rating in any format (e.g. 5/10, 4.5/5, 90%, etc.)
   */
  rating?: string;
  /**
   * List of tags / genres / categories
   */
  tags: string[];
  /**
   * Link to the media item
   */
  href: string;
  /*
   * Video / Music: duration in seconds
   * Book: number of pages
   */
  length?: number;
}

export interface IMediaReleasesIntegration {
  getMediaReleasesAsync(): Promise<MediaRelease[]>;
}
