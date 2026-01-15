import { removeTrailingSlash } from "@homarr/common";
import { fetchWithTrustedCertificatesAsync } from "@homarr/core/infrastructure/http";

import type { IntegrationInput } from "../base/integration";
import { PiHoleIntegrationV5 } from "./v5/pi-hole-integration-v5";
import { PiHoleIntegrationV6 } from "./v6/pi-hole-integration-v6";

export const createPiHoleIntegrationAsync = async (input: IntegrationInput) => {
  try {
    const baseUrl = removeTrailingSlash(input.url);
    const url = new URL(`${baseUrl}/api/info/version`);
    const response = await fetchWithTrustedCertificatesAsync(url);

    /**
     * In pi-hole 5 the api was at /admin/api.php, in pi-hole 6 it was moved to /api
     * For the /api/info/version endpoint, the response is 404 in pi-hole 5
     * and 401 in pi-hole 6
     */
    if (response.status === 404) {
      return new PiHoleIntegrationV5(input);
    }

    return new PiHoleIntegrationV6(input);
  } catch {
    // We fall back to v6 if we can't reach the endpoint
    // This is the case if the integration is not reachable
    // the error will then be handled in the integration
    return new PiHoleIntegrationV6(input);
  }
};
