"use client";

import { useChangeLocale, useCurrentLocale } from "@homarr/translation/client";

import { LanguageCombobox } from "./language-combobox";

interface CurrentLanguageComboboxProps {
  width?: string;
}

export const CurrentLanguageCombobox = ({ width }: CurrentLanguageComboboxProps) => {
  const currentLocale = useCurrentLocale();
  const { changeLocale, isPending } = useChangeLocale();

  return <LanguageCombobox value={currentLocale} onChange={changeLocale} isPending={isPending} width={width} />;
};
