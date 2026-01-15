import { useParams } from "next/navigation";
import dayjs from "dayjs";

import type { SupportedLanguage } from "./config";
import { localeConfigurations } from "./config";

let promise: Promise<void> | null = null;
let loading = true;
let previousLocale: SupportedLanguage | null = null;
const load = () => {
  if (loading) {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw promise;
  }
};
const dayJsLocalization = (locale: SupportedLanguage) => {
  if (promise && previousLocale === locale) {
    return {
      load,
    };
  }
  promise = localeConfigurations[locale]
    .importDayJsLocale()
    .then((dayJsLocale) => {
      dayjs.locale(dayJsLocale);
      loading = false;
      previousLocale = locale;
    })
    .catch(() => {
      loading = false;
    });

  return {
    load,
  };
};

/**
 * Load the dayjs localization for the current locale with suspense
 * This allows us to have the loading spinner shown until the localization is loaded and applied.
 * Suspense works by throwing a promise, which is caught by the nearest Suspense boundary.
 */
export const useSuspenseDayJsLocalization = () => {
  const { locale } = useParams<{ locale: SupportedLanguage }>();
  const resource = dayJsLocalization(locale);

  resource.load();
};
