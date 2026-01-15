import { describe, expect, test, vi } from "vitest";

import * as commonServer from "@homarr/common/server";

import type { PreparedIntegration } from "../../prepare/prepare-integrations";
import { mapAndDecryptIntegrations } from "../map-integration";

describe("Map Integrations", () => {
  test("should map proxmox integration", () => {
    vi.spyOn(commonServer, "decryptSecretWithKey").mockReturnValue("user@realm!tokenId=secret");

    const proxmoxIntegration: PreparedIntegration = {
      type: "proxmox",
      name: "Proxmox",
      url: "https://proxmox.com",
      properties: [
        {
          field: "apiKey",
          value: "any-encrypted-value",
          type: "private",
        },
      ],
    };

    const mappedIntegrations = mapAndDecryptIntegrations([proxmoxIntegration], "encryptionToken");

    expect(mappedIntegrations[0]?.secrets).toEqual([
      {
        field: "username",
        value: "user",
      },
      {
        field: "realm",
        value: "realm",
      },
      {
        field: "tokenId",
        value: "tokenId",
      },
      {
        field: "apiKey",
        value: "secret",
      },
    ]);
  });
});
