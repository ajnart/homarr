import { useState } from "react";
import { Button, FileInput, Group, Stack, TextInput } from "@mantine/core";
import { IconFileUpload } from "@tabler/icons-react";
import { z } from "zod/v4";

import { clientApi } from "@homarr/api/client";
import { revalidatePathActionAsync } from "@homarr/common/client";
import { useZodForm } from "@homarr/form";
import { createModal } from "@homarr/modals";
import { showErrorNotification, showSuccessNotification } from "@homarr/notifications";
import { OldmarrImportAppsSettings, SidebarBehaviourSelect } from "@homarr/old-import/components";
import type { OldmarrImportConfiguration } from "@homarr/old-import/shared";
import { checkJsonImportFile, oldmarrImportConfigurationSchema } from "@homarr/old-import/shared";
import { oldmarrConfigSchema } from "@homarr/old-schema";
import { useScopedI18n } from "@homarr/translation/client";

import { useBoardNameStatus } from "./add-board-modal";

export const ImportBoardModal = createModal(({ actions }) => {
  const tOldImport = useScopedI18n("board.action.oldImport");
  const tCommon = useScopedI18n("common");
  const [fileValid, setFileValid] = useState(true);
  const form = useZodForm(
    z.object({
      file: z.file().check(checkJsonImportFile),
      configuration: oldmarrImportConfigurationSchema,
    }),
    {
      mode: "controlled",
      initialValues: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        file: null!,
        configuration: {
          onlyImportApps: false,
          sidebarBehaviour: "last-section",
          name: "",
        },
      },
      onValuesChange(values, previous) {
        // This is a workarround until async validation is supported by mantine
        void (async () => {
          if (values.file === previous.file) {
            return;
          }

          // Before validation it can still be null
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (!values.file) {
            return;
          }

          const content = await values.file.text();
          const result = oldmarrConfigSchema.safeParse(JSON.parse(content));

          if (!result.success) {
            console.error(result.error.issues);
            setFileValid(false);
            return;
          }

          setFileValid(true);
          form.setFieldValue("configuration.name", result.data.configProperties.name.replaceAll(" ", "-"));
        })();
      },
    },
  );

  const { mutateAsync, isPending } = clientApi.board.importOldmarrConfig.useMutation({
    async onSuccess() {
      await revalidatePathActionAsync("/manage/boards");
    },
  });
  const boardNameStatus = useBoardNameStatus(form.values.configuration.name);

  const handleSubmitAsync = async (values: { file: File; configuration: OldmarrImportConfiguration }) => {
    const formData = new FormData();
    formData.set("file", values.file);
    formData.set("configuration", JSON.stringify(values.configuration));

    await mutateAsync(formData, {
      onSuccess() {
        actions.closeModal();
        showSuccessNotification({
          title: tOldImport("notification.success.title"),
          message: tOldImport("notification.success.message"),
        });
      },
      onError() {
        showErrorNotification({
          title: tOldImport("notification.error.title"),
          message: tOldImport("notification.error.message"),
        });
      },
    });
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        if (!fileValid || !boardNameStatus.canSubmit) {
          return;
        }

        void handleSubmitAsync({
          file: values.file,
          configuration: values.configuration,
        });
      })}
    >
      <Stack>
        <FileInput
          rightSection={<IconFileUpload />}
          withAsterisk
          accept="application/json"
          {...form.getInputProps("file")}
          error={
            (form.getInputProps("file").error as string | undefined) ??
            (!fileValid && form.isDirty("file") ? tOldImport("form.file.invalidError") : undefined)
          }
          type="button"
          label={tOldImport("form.file.label")}
        />

        <OldmarrImportAppsSettings onlyImportApps={form.getInputProps("configuration.onlyImportApps")} />

        <TextInput
          withAsterisk
          label={tOldImport("form.name.label")}
          description={
            boardNameStatus.description ? (
              <Group c={boardNameStatus.description.color} gap="xs" align="center">
                {boardNameStatus.description.icon ? <boardNameStatus.description.icon size={16} /> : null}
                <span>{boardNameStatus.description.label}</span>
              </Group>
            ) : null
          }
          {...form.getInputProps("configuration.name")}
        />

        <SidebarBehaviourSelect {...form.getInputProps("configuration.sidebarBehaviour")} />

        <Group justify="end">
          <Button variant="subtle" color="gray" onClick={actions.closeModal}>
            {tCommon("action.cancel")}
          </Button>
          <Button type="submit" loading={isPending}>
            {tCommon("action.import")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}).withOptions({
  defaultTitle: (t) => t("board.action.oldImport.label"),
  size: "lg",
});
