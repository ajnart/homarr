import type { HomarrDocumentationPath } from "./homarr-docs-sitemap";

const documentationBaseUrl = "https://homarr.dev";

// Please use the method so the path can be checked!
export const createDocumentationLink = (
  path: HomarrDocumentationPath,
  hashTag?: `#${string}`,
  queryParams?: Record<string, string>,
) => {
  const url = `${documentationBaseUrl}${path}`;
  const params = queryParams ? `?${new URLSearchParams(queryParams)}` : "";
  return `${url}${params}${hashTag ?? ""}`;
};
