import type { CurrentSessionsInput, StreamSession } from "./media-server-types";

export interface IMediaServerIntegration {
  getCurrentSessionsAsync(options: CurrentSessionsInput): Promise<StreamSession[]>;
}
