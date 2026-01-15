import type { CommonOldmarrWidgetDefinition } from "./common";

export type OldmarrIframeDefinition = CommonOldmarrWidgetDefinition<
  "iframe",
  {
    embedUrl: string;
    allowFullScreen: boolean;
    allowScrolling: boolean;
    allowTransparency: boolean;
    allowPayment: boolean;
    allowAutoPlay: boolean;
    allowMicrophone: boolean;
    allowCamera: boolean;
    allowGeolocation: boolean;
  }
>;
