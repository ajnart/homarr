export interface StreamSession {
  sessionId: string;
  sessionName: string;
  user: {
    userId: string;
    username: string;
    profilePictureUrl: string | null;
  };
  currentlyPlaying: {
    type: "audio" | "video" | "tv" | "movie";
    name: string;
    seasonName: string | undefined;
    episodeName?: string | null;
    albumName?: string | null;
    episodeCount?: number | null;
    metadata: {
      video: {
        resolution: {
          width: number;
          height: number;
        } | null;
        frameRate: number | null;
      };
      audio: {
        channelCount: number | null;
        codec: string | null;
      };
      transcoding: {
        container: string | null;
        resolution: {
          width: number;
          height: number;
        } | null;
        target: {
          audioCodec: string | null;
          videoCodec: string | null;
        };
      };
    } | null;
  } | null;
}

export interface CurrentSessionsInput {
  showOnlyPlaying: boolean;
}
