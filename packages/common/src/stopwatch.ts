import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.extend(duration);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "one second",
    ss: "%d seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

export class Stopwatch {
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
  }

  getElapsedInHumanWords() {
    const difference = performance.now() - this.startTime;
    if (difference < 1000) {
      return `${Math.floor(difference)} ms`;
    }
    return dayjs().millisecond(this.startTime).fromNow(true);
  }

  getElapsedInMilliseconds() {
    return performance.now() - this.startTime;
  }

  reset() {
    this.startTime = performance.now();
  }
}
