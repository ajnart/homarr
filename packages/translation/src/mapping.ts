import { supportedLanguages } from "./config";

const _enTranslations = () => import("./lang/en.json");
type EnTranslation = typeof _enTranslations;

export const createLanguageMapping = () => {
  const mapping: Record<string, unknown> = {};

  for (const language of supportedLanguages) {
    mapping[language] = () => import(`./lang/${language}.json`);
  }

  return mapping as Record<(typeof supportedLanguages)[number], () => ReturnType<EnTranslation>>;
};

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeys = NestedKeyOf<EnTranslation>;
