/**
 * Priority list that determines the quality of images using their order.
 * Types at the start of the list are better than those at the end.
 * We do this to attempt to find the best quality image for the show.
 */
export const mediaOrganizerPriorities = [
  "cover", // Official, perfect aspect ratio, best for music
  "poster", // Official, perfect aspect ratio
  "banner", // Official, bad aspect ratio
  "disc", // Official, second best for music / books
  "logo", // Official, possibly unrelated
  "fanart", // Unofficial, possibly bad quality
  "screenshot", // Bad aspect ratio, possibly bad quality
  "clearlogo", // Without background, bad aspect ratio,
  "headshot", // Unrelated
  "unknown", // Not known, possibly good or bad, better not to choose
];
