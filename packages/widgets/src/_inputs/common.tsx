import type { WidgetKind } from "@homarr/definitions";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetOptionOfType, WidgetOptionType } from "../options";

export interface CommonWidgetInputProps<TKey extends WidgetOptionType> {
  kind: WidgetKind;
  property: string;
  options: Omit<WidgetOptionOfType<TKey>, "defaultValue" | "type">;
  initialOptions: Record<string, unknown>;
}

type UseWidgetInputTranslationReturnType = (key: "label" | "description") => string;

/**
 * Short description why as and unknown convertions are used below:
 * Typescript was not smart enought to work with the generic of the WidgetKind to only allow properties that are relying within that specified kind.
 * This does not mean, that the function useWidgetInputTranslation can be called with invalid arguments without type errors and rather means that the above widget.<kind>.option.<property> string
 * is not recognized as valid argument for the scoped i18n hook. Because the typesafety should remain outside the usage of those methods I (Meierschlumpf) decided to provide this fully typesafe useWidgetInputTranslation method.
 *
 * Some notes about it:
 * - The label translation can be used for every input, especially considering that all options should have defined a label for themself. The description translation should only be used when withDescription
 *   is defined for the option. The method does sadly not reconize issues with those definitions. So it does not yell at you when you somewhere show the label without having it defined in the translations.
 */
export const useWidgetInputTranslation = (kind: WidgetKind, property: string): UseWidgetInputTranslationReturnType => {
  return useScopedI18n(
    `widget.${kind}.option.${property}` as never, // Because the type is complex and not recognized by typescript, we need to cast it to never to make it work.
  ) as unknown as UseWidgetInputTranslationReturnType;
};
