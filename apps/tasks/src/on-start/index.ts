import { invalidateUpdateCheckerCacheAsync } from "./invalidate-update-checker-cache";
import { cleanupSessionsAsync } from "./session-cleanup";

export async function onStartAsync() {
  await cleanupSessionsAsync();
  await invalidateUpdateCheckerCacheAsync();
}
