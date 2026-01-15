import createMiddleware from "next-intl/middleware";

import type { SupportedLanguage } from ".";
import { supportedLanguages } from "./config";
import { createRouting } from "./routing";

export const createI18nMiddleware = (defaultLocale: SupportedLanguage) =>
  createMiddleware(createRouting(defaultLocale));

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", `/(${supportedLanguages.join("|")})/:path*`],
};
