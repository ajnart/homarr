import type { NamespaceKeys, NestedKeyOf } from "next-intl";

import type { RemoveReadonly } from "@homarr/common/types";

import type { useI18n, useScopedI18n } from "./client";
import type enTranslation from "./lang/en.json";

export type TranslationFunction = ReturnType<typeof useI18n<never>>;
export type ScopedTranslationFunction<
  NestedKey extends NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>> = never,
> = ReturnType<typeof useScopedI18n<NestedKey>>;
export type TranslationObject = typeof enTranslation;
export type stringOrTranslation = string | ((t: TranslationFunction) => string);

declare global {
  // Use type safe message keys with `next-intl`
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IntlMessages extends RemoveReadonly<TranslationObject> {}
}
