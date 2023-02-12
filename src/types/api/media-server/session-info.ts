export type GenericSessionInfo = {
  supportsMediaControl: boolean;
  username: string | undefined;
  sessionName: string;
  userProfilePicture: string | undefined;
  currentlyPlaying:
    | {
        name: string;
        type: 'audio' | 'video' | 'tv';
        metadata: {
          video: {
            videoCodec: string;
            videoFrameRate: string;
            height: number;
            width: number;
            bitrate: number;
          };
          audio: {
            audioCodec: string;
            audioChannels: number;
          };
          transcoding: {
            context: string;
            sourceVideoCodec: string;
            sourceAudioCodec: string;
            videoDecision: string;
            audioDecision: string;
            container: string;
            videoCodec: string;
            audioCodec: string;
            error: boolean;
            duration: number;
            audioChannels: number;
            width: number;
            height: number;
            transcodeHwRequested: boolean;
            timeStamp: number;
          } | undefined;
        };
      }
    | undefined;
};
