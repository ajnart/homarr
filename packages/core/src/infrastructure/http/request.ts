import type { AgentOptions } from "node:https";
import { Agent as HttpsAgent } from "node:https";
import { checkServerIdentity } from "node:tls";
import axios from "axios";
import type { RequestInfo, RequestInit, Response } from "undici";
import { fetch } from "undici";

import {
  getAllTrustedCertificatesAsync,
  getTrustedCertificateHostnamesAsync,
} from "@homarr/core/infrastructure/certificates";
import { UndiciHttpAgent } from "@homarr/core/infrastructure/http";

import type { TrustedCertificateHostname } from "../certificates/hostnames";
import { withTimeoutAsync } from "./timeout";

export const createCustomCheckServerIdentity = (
  trustedHostnames: TrustedCertificateHostname[],
): typeof checkServerIdentity => {
  return (hostname, peerCertificate) => {
    const matchingTrustedHostnames = trustedHostnames.filter(
      (cert) => cert.thumbprint === peerCertificate.fingerprint256,
    );

    // We trust the certificate if we have a matching hostname
    if (matchingTrustedHostnames.some((cert) => cert.hostname === hostname)) return undefined;

    return checkServerIdentity(hostname, peerCertificate);
  };
};

export const createCertificateAgentAsync = async (override?: {
  ca: string | string[];
  checkServerIdentity: typeof checkServerIdentity;
}) => {
  return new UndiciHttpAgent({
    connect: override ?? {
      ca: await getAllTrustedCertificatesAsync(),
      checkServerIdentity: createCustomCheckServerIdentity(await getTrustedCertificateHostnamesAsync()),
    },
  });
};

export const createHttpsAgentAsync = async (override?: Pick<AgentOptions, "ca" | "checkServerIdentity">) => {
  return new HttpsAgent({
    ca: await getAllTrustedCertificatesAsync(),
    checkServerIdentity: createCustomCheckServerIdentity(await getTrustedCertificateHostnamesAsync()),
    // Override the ca and checkServerIdentity if provided
    ...override,
    proxyEnv: process.env,
  });
};

export const createAxiosCertificateInstanceAsync = async (
  override?: Pick<AgentOptions, "ca" | "checkServerIdentity">,
) => {
  return axios.create({
    httpsAgent: await createHttpsAgentAsync(override),
  });
};

export const fetchWithTrustedCertificatesAsync = async (
  url: RequestInfo,
  options?: RequestInit & { timeout?: number },
): Promise<Response> => {
  const agent = await createCertificateAgentAsync(undefined);
  if (options?.timeout) {
    return await withTimeoutAsync(
      async (signal) =>
        fetch(url, {
          ...options,
          signal,
          dispatcher: agent,
        }),
      options.timeout,
    );
  }

  return fetch(url, {
    ...options,
    dispatcher: agent,
  });
};
