import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { api } from "@homarr/api/server";
import { localeCookieKey } from "@homarr/definitions";
import type { SupportedLanguage } from "@homarr/translation";
import { supportedLanguages } from "@homarr/translation";
import { createI18nMiddleware } from "@homarr/translation/middleware";

let isOnboardingFinished = false;

export async function proxy(request: NextRequest) {
  // Redirect to onboarding if it's not finished yet
  const pathname = request.nextUrl.pathname;

  if (!isOnboardingFinished && !pathname.endsWith("/init")) {
    const currentOnboardingStep = await api.onboard.currentStep();
    if (currentOnboardingStep.current !== "finish") {
      return NextResponse.redirect(new URL("/init", request.url));
    }

    isOnboardingFinished = true;
  }

  // Only run this if the user has not already configured their language
  const currentLocale = request.cookies.get(localeCookieKey)?.value;
  let defaultLocale: SupportedLanguage = "en";
  if (!currentLocale || !supportedLanguages.includes(currentLocale as SupportedLanguage)) {
    defaultLocale = await api.serverSettings.getCulture().then((culture) => culture.defaultLocale);
  }

  // We don't want to fallback to accept-language header so we clear it
  request.headers.set("accept-language", "");

  const next = createI18nMiddleware(defaultLocale);
  return next(request);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
