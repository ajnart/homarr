import type { IMediaServerIntegration } from "../../interfaces/media-server/media-server-integration";
import type { CurrentSessionsInput, StreamSession } from "../../interfaces/media-server/media-server-types";

export class MediaServerMockService implements IMediaServerIntegration {
  public async getCurrentSessionsAsync(options: CurrentSessionsInput): Promise<StreamSession[]> {
    return await Promise.resolve(
      Array.from({ length: 10 }, (_, index) => MediaServerMockService.createSession(index)).filter(
        (session) => !options.showOnlyPlaying || session.currentlyPlaying !== null,
      ),
    );
  }

  private static createSession(index: number): StreamSession {
    return {
      sessionId: `session-${index}`,
      sessionName: `Session ${index}`,
      user: {
        userId: `user-${index}`,
        username: `User${index}`,
        profilePictureUrl: "/images/mock/avatar.jpg",
      },
      currentlyPlaying:
        Math.random() > 0.9 // 10% chance of being null (not currently playing)
          ? {
              type: "movie",
              name: `Movie ${index}`,
              seasonName: undefined,
              episodeName: null,
              albumName: null,
              episodeCount: null,
              metadata: null,
            }
          : null,
    };
  }
}
