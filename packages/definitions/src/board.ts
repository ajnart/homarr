import type { inferDefinitionType } from "./_definition";
import { createDefinition } from "./_definition";

export const backgroundImageAttachments = createDefinition(["fixed", "scroll"], { defaultValue: "fixed" });
export const backgroundImageRepeats = createDefinition(["repeat", "repeat-x", "repeat-y", "no-repeat"], {
  defaultValue: "no-repeat",
});
export const backgroundImageSizes = createDefinition(["cover", "contain"], {
  defaultValue: "cover",
});

export type BackgroundImageAttachment = inferDefinitionType<typeof backgroundImageAttachments>;
export type BackgroundImageRepeat = inferDefinitionType<typeof backgroundImageRepeats>;
export type BackgroundImageSize = inferDefinitionType<typeof backgroundImageSizes>;
