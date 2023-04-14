export type GenericSessionInfo = {
  supportsMediaControl: boolean;
  username: string | undefined;
  id: string | undefined;
  sessionName: string;
  userProfilePicture: string | undefined;
  currentlyPlaying: GenericCurrentlyPlaying | undefined;
};

export type GenericCurrentlyPlaying = {
  name: string;
  seasonName: string | undefined;
  episodeName: string | undefined;
  albumName: string | undefined;
  episodeCount: number | undefined;
  type: 'audio' | 'video' | 'tv' | 'movie' | undefined;
  metadata: {
    video:
      | {
          videoCodec: string | undefined;
          videoFrameRate: string | undefined;
          height: number | undefined;
          width: number | undefined;
          bitrate: number | undefined;
        }
      | undefined;
    audio:
      | {
          audioCodec: string | undefined;
          audioChannels: number | undefined;
        }
      | undefined;
    transcoding:
      | {
          context: string | undefined;
          sourceVideoCodec: string | undefined;
          sourceAudioCodec: string | undefined;
          videoDecision: string | undefined;
          audioDecision: string | undefined;
          container: string | undefined;
          videoCodec: string | undefined;
          audioCodec: string | undefined;
          error: boolean | undefined;
          duration: number | undefined;
          audioChannels: number | undefined;
          width: number | undefined;
          height: number | undefined;
          transcodeHwRequested: boolean | undefined;
          timeStamp: number | undefined;
        }
      | undefined;
  };
};
