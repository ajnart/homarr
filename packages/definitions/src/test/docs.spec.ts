/* eslint-disable no-restricted-syntax */
import { describe, expect, test } from "vitest";

import { createDocumentationLink } from "../docs";
import type { HomarrDocumentationPath } from "../docs/homarr-docs-sitemap";

describe("createDocumentationLink should generate correct URLs", () => {
  test.each([
    ["/docs/getting-started", undefined, undefined, "https://homarr.dev/docs/getting-started"],
    ["/blog", undefined, undefined, "https://homarr.dev/blog"],
    ["/docs/widgets/weather", "#configuration", undefined, "https://homarr.dev/docs/widgets/weather#configuration"],
    [
      "/docs/advanced/environment-variables",
      undefined,
      { lang: "en" },
      "https://homarr.dev/docs/advanced/environment-variables?lang=en",
    ],
    [
      "/docs/widgets/bookmarks",
      "#sorting",
      { lang: "fr", theme: "dark" },
      "https://homarr.dev/docs/widgets/bookmarks?lang=fr&theme=dark#sorting",
    ],
  ] satisfies [HomarrDocumentationPath, `#${string}` | undefined, Record<string, string> | undefined, string][])(
    "should create correct URL for path %s with hash %s and params %o",
    (path, hashTag, queryParams, expected) => {
      expect(createDocumentationLink(path, hashTag, queryParams)).toBe(expected);
    },
  );
});

describe("createDocumentationLink parameter validation", () => {
  test("should work with only path parameter", () => {
    const result = createDocumentationLink("/docs/getting-started");
    expect(result).toBe("https://homarr.dev/docs/getting-started");
  });

  test("should work with path and hashtag", () => {
    const result = createDocumentationLink("/docs/getting-started", "#installation");
    expect(result).toBe("https://homarr.dev/docs/getting-started#installation");
  });

  test("should work with path and query params", () => {
    const result = createDocumentationLink("/docs/getting-started", undefined, { version: "1.0" });
    expect(result).toBe("https://homarr.dev/docs/getting-started?version=1.0");
  });
});
