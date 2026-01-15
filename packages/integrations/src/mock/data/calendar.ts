import type { ICalendarIntegration } from "../../interfaces/calendar/calendar-integration";
import type { CalendarEvent } from "../../interfaces/calendar/calendar-types";

export class CalendarMockService implements ICalendarIntegration {
  public async getCalendarEventsAsync(start: Date, end: Date, _includeUnmonitored: boolean): Promise<CalendarEvent[]> {
    const result = [homarrMeetup(start, end), titanicRelease(start, end), seriesRelease(start, end)];
    return await Promise.resolve(result);
  }
}

const homarrMeetup = (start: Date, end: Date): CalendarEvent => {
  const startDate = randomDateBetween(start, end);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
  return {
    title: "Homarr Meetup",
    subTitle: "",
    description: "Yearly meetup of the Homarr community",
    startDate,
    endDate,
    image: null,
    location: "Mountains",
    indicatorColor: "#fa5252",
    links: [
      {
        href: "https://homarr.dev",
        name: "Homarr",
        logo: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/homarr.svg",
        color: "#000000",
        isDark: true,
      },
    ],
  };
};

const titanicRelease = (start: Date, end: Date): CalendarEvent => ({
  title: "Titanic",
  subTitle: "A classic movie",
  description: "A tragic love story set on the ill-fated RMS Titanic.",
  startDate: randomDateBetween(start, end),
  endDate: null,
  image: {
    src: "https://image.tmdb.org/t/p/original/5bTWA20cL9LCIGNpde4Epc2Ijzn.jpg",
    aspectRatio: { width: 7, height: 12 },
  },
  location: null,
  metadata: {
    type: "radarr",
    releaseType: "inCinemas",
  },
  indicatorColor: "cyan",
  links: [
    {
      href: "https://www.imdb.com/title/tt0120338/",
      name: "IMDb",
      color: "#f5c518",
      isDark: false,
      logo: "/images/apps/imdb.svg",
    },
  ],
});

const seriesRelease = (start: Date, end: Date): CalendarEvent => ({
  title: "The Mandalorian",
  subTitle: "A Star Wars Series",
  description: "A lone bounty hunter in the outer reaches of the galaxy.",
  startDate: randomDateBetween(start, end),
  endDate: null,
  image: {
    src: "https://image.tmdb.org/t/p/original/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    aspectRatio: { width: 7, height: 12 },
    badge: {
      content: "S1/E1",
      color: "red",
    },
  },
  location: null,
  indicatorColor: "blue",
  links: [
    {
      href: "https://www.imdb.com/title/tt8111088/",
      name: "IMDb",
      color: "#f5c518",
      isDark: false,
      logo: "/images/apps/imdb.svg",
    },
  ],
});

function randomDateBetween(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
