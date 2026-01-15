import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";

export const formatMetadata = (metadata: Record<string, unknown> | Error, ignoreKeys?: string[]) => {
  const metadataObject = metadata instanceof ErrorWithMetadata ? metadata.metadata : metadata;

  const filteredMetadata = Object.keys(metadataObject)
    .filter((key) => !ignoreKeys?.includes(key))
    .map((key) => ({ key, value: metadataObject[key as keyof typeof metadataObject] }))
    .filter(({ value }) => typeof value !== "object" && typeof value !== "function");

  return filteredMetadata.map(({ key, value }) => `${key}="${value as string}"`).join(" ");
};
