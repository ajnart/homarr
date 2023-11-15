import { HomeAssistant } from '../server/sdk/homeassistant/HomeAssistant';

export class HomeAssistantSingleton {
  private static _instances: HomeAssistant[] = [];

  public static getOrSet(url: URL, token: string): HomeAssistant {
    const match = this._instances.find(
      (instance) =>
        instance.basePath.hostname === url.hostname && instance.basePath.port === url.port
    );

    if (!match) {
      const instance = new HomeAssistant(url, token);
      this._instances.push(instance);
      return instance;
    }

    return match;
  }
}
