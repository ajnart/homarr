"use client";

import { Switch } from "@mantine/core";

import type { ServerSettings } from "@homarr/server-settings";
import { useScopedI18n } from "@homarr/translation/client";

import { CommonSettingsForm } from "./common-form";

export const UserSettingsForm = ({ defaultValues }: { defaultValues: ServerSettings["user"] }) => {
  const tUser = useScopedI18n("management.page.settings.section.user");

  return (
    <CommonSettingsForm settingKey="user" defaultValues={defaultValues}>
      {(form) => (
        <>
          <Switch
            {...form.getInputProps("enableGravatar", { type: "checkbox" })}
            label={tUser("enableGravatar.label")}
            description={tUser("enableGravatar.description")}
          />
        </>
      )}
    </CommonSettingsForm>
  );
};
