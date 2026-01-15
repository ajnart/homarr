import { zfd } from "zod-form-data";
import { z } from "zod/v4";

import { boardNameSchema } from "@homarr/validation/board";
import { createCustomErrorParams } from "@homarr/validation/form/i18n";

export const sidebarBehaviours = ["remove-items", "last-section"] as const;
export const defaultSidebarBehaviour = "last-section";
export type SidebarBehaviour = (typeof sidebarBehaviours)[number];

export const oldmarrImportConfigurationSchema = z.object({
  name: boardNameSchema,
  onlyImportApps: z.boolean().default(false),
  sidebarBehaviour: z.enum(sidebarBehaviours).default(defaultSidebarBehaviour),
});

export type OldmarrImportConfiguration = z.infer<typeof oldmarrImportConfigurationSchema>;

export const initialOldmarrImportSettings = oldmarrImportConfigurationSchema.pick({
  onlyImportApps: true,
  sidebarBehaviour: true,
});

export type InitialOldmarrImportSettings = z.infer<typeof initialOldmarrImportSettings>;

export const checkJsonImportFile: z.core.CheckFn<File> = (context) => {
  if (context.value.type !== "application/json") {
    context.issues.push({
      code: "custom",
      params: createCustomErrorParams({
        key: "invalidFileType",
        params: { expected: "JSON" },
      }),
      input: context.value.type,
    });
    return;
  }

  if (context.value.size > 1024 * 1024) {
    context.issues.push({
      code: "custom",
      params: createCustomErrorParams({
        key: "fileTooLarge",
        params: { maxSize: "1 MB" },
      }),
      input: context.value.size,
    });
    return;
  }
};

export const importJsonFileSchema = zfd.formData({
  file: zfd.file().check(checkJsonImportFile),
  configuration: zfd.json(oldmarrImportConfigurationSchema),
});
