import { createId } from "@homarr/common";
import { decryptSecretWithKey } from "@homarr/common/server";
import type { IntegrationKind } from "@homarr/definitions";
import type { OldmarrIntegrationType } from "@homarr/old-schema";

import type { PreparedIntegration } from "../prepare/prepare-integrations";

export const mapIntegrationType = (type: OldmarrIntegrationType) => {
  const kind = mapping[type];
  if (!kind) {
    throw new Error(`Integration type ${type} is not supported yet`);
  }
  return kind;
};

const mapping: Record<OldmarrIntegrationType, IntegrationKind | null> = {
  adGuardHome: "adGuardHome",
  deluge: "deluge",
  homeAssistant: "homeAssistant",
  jellyfin: "jellyfin",
  jellyseerr: "jellyseerr",
  lidarr: "lidarr",
  nzbGet: "nzbGet",
  openmediavault: "openmediavault",
  overseerr: "overseerr",
  pihole: "piHole",
  prowlarr: "prowlarr",
  proxmox: "proxmox",
  qBittorrent: "qBittorrent",
  radarr: "radarr",
  readarr: "readarr",
  sabnzbd: "sabNzbd",
  sonarr: "sonarr",
  tdarr: "tdarr",
  transmission: "transmission",
  plex: "plex",
};

export const mapAndDecryptIntegrations = (
  preparedIntegrations: PreparedIntegration[],
  encryptionToken: string | null,
) => {
  if (encryptionToken === null) {
    return [];
  }

  return preparedIntegrations.map(({ type, name, url, properties }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const kind = mapIntegrationType(type!);

    return {
      id: createId(),
      name,
      url,
      kind,
      secrets: mapSecrets(properties, encryptionToken, kind),
    };
  });
};

const mapSecrets = (properties: PreparedIntegration["properties"], encryptionToken: string, kind: IntegrationKind) => {
  const key = Buffer.from(encryptionToken, "hex");

  const decryptedProperties = properties.map((property) => ({
    ...property,
    value: property.value ? decryptSecretWithKey(property.value as `${string}.${string}`, key) : null,
  }));

  return kind === "proxmox" ? mapProxmoxSecrets(decryptedProperties) : decryptedProperties;
};

/**
 * Proxmox secrets have bee split up from format `user@realm!tokenId=secret` to separate fields
 */
const mapProxmoxSecrets = (decryptedProperties: PreparedIntegration["properties"]) => {
  const apiToken = decryptedProperties.find((property) => property.field === "apiKey");

  if (!apiToken?.value) return [];

  let splitValues = apiToken.value.split("@");

  if (splitValues.length <= 1) return [];

  const [user, ...rest] = splitValues;

  splitValues = rest.join("@").split("!");

  if (splitValues.length <= 1) return [];

  const [realm, ...rest2] = splitValues;

  splitValues = rest2.join("!").split("=");

  if (splitValues.length <= 1) return [];

  const [tokenId, ...rest3] = splitValues;

  const secret = rest3.join("=");

  return [
    {
      field: "username" as const,
      value: user,
    },
    {
      field: "realm" as const,
      value: realm,
    },
    {
      field: "tokenId" as const,
      value: tokenId,
    },
    {
      field: "apiKey" as const,
      value: secret,
    },
  ];
};
