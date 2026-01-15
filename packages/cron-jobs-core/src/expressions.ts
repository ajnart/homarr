import { checkCron } from "./validation";

export const EVERY_5_SECONDS = checkCron("*/5 * * * * *") satisfies string;
export const EVERY_30_SECONDS = checkCron("*/30 * * * * *") satisfies string;
export const EVERY_MINUTE = checkCron("* * * * *") satisfies string;
export const EVERY_5_MINUTES = checkCron("*/5 * * * *") satisfies string;
export const EVERY_10_MINUTES = checkCron("*/10 * * * *") satisfies string;
export const EVERY_HOUR = checkCron("0 * * * *") satisfies string;
export const EVERY_DAY = checkCron("0 0 * * */1") satisfies string;
export const EVERY_WEEK = checkCron("0 0 * * 1") satisfies string;
