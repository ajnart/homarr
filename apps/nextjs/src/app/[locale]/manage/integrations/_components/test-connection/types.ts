import type { RouterOutputs } from "@homarr/api";

export type AnyMappedTestConnectionError = Exclude<RouterOutputs["integration"]["create"], undefined>["error"];
export type MappedTestConnectionCertificateError = Extract<AnyMappedTestConnectionError, { type: "certificate" }>;
export type MappedCertificate = MappedTestConnectionCertificateError["data"]["certificate"];
export type MappedError = Exclude<AnyMappedTestConnectionError["cause"], undefined>;
