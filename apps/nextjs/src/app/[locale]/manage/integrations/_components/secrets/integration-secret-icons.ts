import {
  IconCode,
  IconGrid3x3,
  IconKey,
  IconLink,
  IconMessage,
  IconPassword,
  IconPasswordUser,
  IconPlug,
  IconServer,
  IconUser,
} from "@tabler/icons-react";

import type { IntegrationSecretKind } from "@homarr/definitions";
import type { TablerIcon } from "@homarr/ui";

export const integrationSecretIcons = {
  username: IconUser,
  apiKey: IconKey,
  password: IconPassword,
  realm: IconServer,
  tokenId: IconGrid3x3,
  personalAccessToken: IconPasswordUser,
  topic: IconMessage,
  url: IconLink,
  opnsenseApiKey: IconKey,
  opnsenseApiSecret: IconPassword,
  githubAppId: IconCode,
  githubInstallationId: IconPlug,
  privateKey: IconKey,
} satisfies Record<IntegrationSecretKind, TablerIcon>;
