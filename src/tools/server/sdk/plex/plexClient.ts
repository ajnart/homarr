import { Element, xml2js } from 'xml-js';
import { GenericCurrentlyPlaying, GenericSessionInfo } from '~/types/api/media-server/session-info';

export class PlexClient {
  constructor(
    private readonly apiAddress: string,
    private readonly token: string
  ) {}

  async getSessions(): Promise<GenericSessionInfo[]> {
    const response = await fetch(`${this.apiAddress}/status/sessions?X-Plex-Token=${this.token}`);
    const body = await response.text();

    // convert xml response to objects, as there is no JSON api
    const data = xml2js(body);

    // TODO: Investigate when there are no media containers
    const mediaContainer = data.elements[0] as Element;

    // no sessions are open or available
    if (!mediaContainer.elements?.some((_) => true)) {
      return [];
    }

    const videoElements = mediaContainer.elements as Element[];

    const videos = videoElements
      .map((videoElement): GenericSessionInfo | undefined => {
        // extract the elements from the children
        const userElement = this.findElement('User', videoElement.elements);
        const playerElement = this.findElement('Player', videoElement.elements);
        const mediaElement = this.findElement('Media', videoElement.elements);
        const sessionElement = this.findElement('Session', videoElement.elements);
        const transcodingElement = this.findElement('TranscodeSession', videoElement.elements);

        if (!playerElement || !mediaElement) {
          return undefined;
        }

        const { videoCodec, videoFrameRate, audioCodec, audioChannels, height, width, bitrate } =
          mediaElement;

        return {
          id: sessionElement?.id as string | undefined,
          username: userElement?.title ?? ('Anonymous' as string),
          userProfilePicture: userElement?.thumb as string | undefined,
          sessionName: `${playerElement.product} (${playerElement.title})`,
          currentlyPlaying: {
            name: `${videoElement.attributes?.grandparentTitle ?? videoElement.attributes?.title}`,
            seasonName: videoElement.attributes?.parentTitle,
            episodeName: videoElement.attributes?.title,
            episodeCount: videoElement.attributes?.index ?? undefined,
            type: this.getCurrentlyPlayingType(videoElement.attributes?.type as string),
            metadata: {
              video: {
                bitrate,
                height,
                videoCodec,
                videoFrameRate,
                width,
              },
              audio: {
                audioChannels,
                audioCodec,
              },
              transcoding:
                transcodingElement === undefined
                  ? undefined
                  : {
                      audioChannels: transcodingElement.audioChannels,
                      audioCodec: transcodingElement.audioCodec,
                      audioDecision: transcodingElement.audioDecision,
                      container: transcodingElement.container,
                      context: transcodingElement.context,
                      duration: transcodingElement.duration,
                      error: transcodingElement.error === 1,
                      height: transcodingElement.height,
                      sourceAudioCodec: transcodingElement.sourceAudioCodec,
                      sourceVideoCodec: transcodingElement.sourceVideoCodec,
                      timeStamp: transcodingElement.timeStamp,
                      transcodeHwRequested: transcodingElement.transcodeHwRequested === 1,
                      videoCodec: transcodingElement.videoCodec,
                      videoDecision: transcodingElement.videoDecision,
                      width: transcodingElement.width,
                    },
            },
          },
        } as GenericSessionInfo;
      })
      .filter((x) => x !== undefined) as GenericSessionInfo[];

    return videos;
  }

  private findElement(name: string, elements: Element[] | undefined) {
    return elements?.find((x) => x.name === name)?.attributes;
  }

  private getCurrentlyPlayingType(type: string): GenericCurrentlyPlaying['type'] {
    switch (type) {
      case 'movie':
        return 'movie';
      case 'episode':
        return 'video';
      case 'track':
        return 'audio';
      default:
        return undefined;
    }
  }
}
