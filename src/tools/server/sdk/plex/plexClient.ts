import { xml2js, Element } from 'xml-js';

export class PlexClient {
  constructor(private readonly apiAddress: string, private readonly token: string) {}

  async getSessions(): Promise<PlexSession[]> {
    const response = await fetch(`${this.apiAddress}/status/sessions?X-Plex-Token=${this.token}`);
    const body = await response.text();

    // convert xml response to objects, as there is no JSON api
    const data = xml2js(body);

    // TODO: Investigate when there are no media containers
    const mediaContainer = data.elements[0] as Element;
    const videoElements = mediaContainer.elements as Element[];

    const videos = videoElements
      .map((videoElement): PlexSession | undefined => {
        // Extract the elements from the children
        const userElement = this.findElement('User', videoElement.elements);
        const playerElement = this.findElement('Player', videoElement.elements);

        if (!userElement || !playerElement) {
          return undefined;
        }

        // Wrap the data in a temporary DTO
        return {
          title: videoElement.attributes?.title as string,
          username: userElement.title as string,
          userThumb: userElement.thumb as string,
          product: playerElement.product as string,
          player: playerElement.title as string,
          type: videoElement.attributes?.type as PlexSession['type'],
        };
      })
      .filter((x) => x !== undefined) as PlexSession[];

    return videos;
  }

  private findElement(name: string, elements: Element[] | undefined) {
    return elements?.find((x) => x.name === name)?.attributes;
  }
}

export type PlexSession = {
  /**
   * The title of the content being played
   */
  title: string;

  /**
   * The username
   */
  username: string;

  /**
   * A relative link to the user profile picture
   */
  userThumb: string;

  /**
   * The product in use, eg. Plex Web
   */
  product: string;

  /**
   * The player in use, eg. Firefox
   */
  player: string;

  /**
   * The type of content being played
   * Video: A single video like a movie
   * Track: A audio track
   */
  type: 'video' | 'track';
};
