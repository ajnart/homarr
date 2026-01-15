"use client";

import type { ServerSettings } from "@homarr/server-settings";
import type { SupportedLanguage } from "@homarr/translation";
import { useScopedI18n } from "@homarr/translation/client";

import { LanguageCombobox } from "~/components/language/language-combobox";
import { CommonSettingsForm } from "./common-form";

export const CultureSettingsForm = ({ defaultValues }: { defaultValues: ServerSettings["culture"] }) => {
  const tCulture = useScopedI18n("management.page.settings.section.culture");

  return (
    <CommonSettingsForm settingKey="culture" defaultValues={defaultValues}>
      {(form) => (
        <>
          <LanguageCombobox
            label={tCulture("defaultLocale.label")}
            value={form.getInputProps("defaultLocale").value as SupportedLanguage}
            {...form.getInputProps("defaultLocale")}
          />
        </>
      )}
    </CommonSettingsForm>
  );
};
