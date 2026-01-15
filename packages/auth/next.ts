import { cache } from "react";

import { createConfiguration } from "./configuration";

const { auth: defaultAuth } = createConfiguration("unknown", null, false);

/**
 * This is the main way to get session data for your RSCs.
 * This will de-duplicate all calls to next-auth's default `auth()` function and only call it once per request
 */
export const auth = cache(defaultAuth);
