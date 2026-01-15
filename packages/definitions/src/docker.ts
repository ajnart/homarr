export const dockerContainerStates = [
  "created",
  "running",
  "paused",
  "restarting",
  "exited",
  "removing",
  "dead",
] as const;

export type DockerContainerState = (typeof dockerContainerStates)[number];
