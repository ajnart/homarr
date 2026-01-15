import type { IntegrationSecretKind } from "@homarr/definitions";

export interface IntegrationSecret {
  kind: IntegrationSecretKind;
  value: string;
}
