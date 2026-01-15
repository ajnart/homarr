import { z } from "zod/v4";

import { createCustomErrorParams } from "./form/i18n";

export const certificateValidFileNameSchema = z.string().regex(/^[\w\-. ]+$/);

export const checkCertificateFile: z.core.CheckFn<File> = (context) => {
  const result = certificateValidFileNameSchema.safeParse(context.value.name);
  if (!result.success) {
    context.issues.push({
      code: "custom",
      params: createCustomErrorParams({
        key: "invalidFileName",
        params: {},
      }),
      input: context.value.name,
    });
    return;
  }

  if (!context.value.name.endsWith(".crt") && !context.value.name.endsWith(".pem")) {
    context.issues.push({
      code: "custom",
      params: createCustomErrorParams({
        key: "invalidFileType",
        params: { expected: ".crt" },
      }),
      input: context.value.name,
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
