import { describe, expect, it } from "vitest";

import { objectEntries } from "@homarr/common";

import { integrationDefs } from "../integration";

describe("Icon url's of integrations should be valid and return 200", () => {
  objectEntries(integrationDefs).forEach(([integration, { iconUrl }]) => {
    it.concurrent(`should return 200 for ${integration}`, async () => {
      const res = await fetch(iconUrl);
      expect(res.status).toBe(200);
    });
  });
});
