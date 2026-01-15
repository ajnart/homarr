import type { IMediaReleasesIntegration, MediaRelease } from "../../interfaces/media-releases";

export class MediaReleasesMockService implements IMediaReleasesIntegration {
  public async getMediaReleasesAsync(): Promise<MediaRelease[]> {
    return await Promise.resolve(mockMediaReleases);
  }
}

export const mockMediaReleases: MediaRelease[] = [
  {
    id: "1",
    type: "movie",
    title: "Inception",
    subtitle: "A mind-bending thriller",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.",
    releaseDate: new Date("2010-07-16"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/inception_backdrop.jpg",
    },
    producer: "Warner Bros.",
    price: 14.99,
    rating: "8.8/10",
    tags: ["Sci-Fi", "Thriller"],
    href: "https://example.com/inception",
    length: 148,
  },
  {
    id: "2",
    type: "tv",
    title: "Breaking Bad",
    subtitle: "S5E14 - Ozymandias",
    description: "When Walter White's secret is revealed, he must face the consequences of his actions.",
    releaseDate: new Date("2013-09-15"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/breaking_bad_backdrop.jpg",
    },
    producer: "AMC",
    rating: "9.5/10",
    tags: ["Crime", "Drama"],
    href: "https://example.com/breaking_bad",
  },
  {
    id: "3",
    type: "music",
    title: "Random Access Memories",
    subtitle: "Daft Punk",
    description: "The fourth studio album by French electronic music duo Daft Punk.",
    releaseDate: new Date("2013-05-17"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/ram_backdrop.jpg",
    },
    producer: "Columbia Records",
    price: 9.99,
    rating: "8.5/10",
    tags: ["Electronic", "Dance", "Pop", "Funk"],
    href: "https://example.com/ram",
  },
  {
    id: "4",
    type: "book",
    title: "The Great Gatsby",
    subtitle: "F. Scott Fitzgerald",
    description: "A novel about the American dream and the disillusionment that comes with it.",
    releaseDate: new Date("1925-04-10"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/gatsby_backdrop.jpg",
    },
    producer: "Scribner",
    price: 10.99,
    rating: "4.2/5",
    tags: ["Classic", "Fiction"],
    href: "https://example.com/gatsby",
  },
  {
    id: "5",
    type: "game",
    title: "The Legend of Zelda: Breath of the Wild",
    subtitle: "Nintendo Switch",
    description: "An open-world action-adventure game set in the fantasy land of Hyrule.",
    releaseDate: new Date("2017-03-03"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/zelda_backdrop.jpg",
    },
    producer: "Nintendo",
    price: 59.99,
    rating: "10/10",
    tags: ["Action", "Adventure"],
    href: "https://example.com/zelda",
  },
  {
    id: "6",
    type: "article",
    title: "The Rise of AI in Healthcare",
    subtitle: "Tech Innovations",
    description: "Exploring the impact of artificial intelligence on the healthcare industry.",
    releaseDate: new Date("2023-10-01"),
    imageUrls: {
      poster: "https://media.outnow.ch/Movies/Bilder/2025/MinecraftMovie/015.jpg",
      backdrop: "https://example.com/ai_healthcare_backdrop.jpg",
    },
    producer: "Tech Innovations",
    rating: "4.8/5",
    tags: ["Technology", "Healthcare"],
    href: "https://example.com/ai_healthcare",
  },
  {
    id: "7",
    type: "video",
    title: "Wir LIEBEN unsere MAMAS | 50 Fragen zu Mamas",
    releaseDate: new Date("2024-05-18T17:00:00Z"),
    imageUrls: {
      poster:
        "https://i.ytimg.com/vi/a3qyfXc1Pfg/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBQKm0viRlfRjTV-V24vGO83rPaVw",
      backdrop:
        "https://i.ytimg.com/vi/a3qyfXc1Pfg/hq720.jpg?sqp=-oaymwEnCNAFEJQDSFryq4qpAxkIARUAAIhCGAHYAQHiAQoIGBACGAY4AUAB&rs=AOn4CLBQKm0viRlfRjTV-V24vGO83rPaVw",
    },
    producer: "PietSmiet",
    rating: "1K",
    tags: [],
    href: "https://www.youtube.com/watch?v=a3qyfXc1Pfg",
  },
];
