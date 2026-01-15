"use client";

import { Select } from "@mantine/core";

import { clientApi } from "@homarr/api/client";
import type { ServerSettings } from "@homarr/server-settings";
import { useScopedI18n } from "@homarr/translation/client";

import { CommonSettingsForm } from "./common-form";

export const SearchSettingsForm = ({ defaultValues }: { defaultValues: ServerSettings["search"] }) => {
  const tSearch = useScopedI18n("management.page.settings.section.search");
  const [selectableSearchEngines] = clientApi.searchEngine.getSelectable.useSuspenseQuery({ withIntegrations: false });

  return (
    <CommonSettingsForm settingKey="search" defaultValues={defaultValues}>
      {(form) => (
        <>
          <Select
            label={tSearch("defaultSearchEngine.label")}
            description={tSearch("defaultSearchEngine.description")}
            data={selectableSearchEngines}
            {...form.getInputProps("defaultSearchEngineId")}
          />
        </>
      )}
    </CommonSettingsForm>
  );
};
