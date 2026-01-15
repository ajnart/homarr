import type { JobCallback } from "./creator";

export const jobRegistry = new Map<string, ReturnType<JobCallback<string, string>>>();
