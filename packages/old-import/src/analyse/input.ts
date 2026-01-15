import { zfd } from "zod-form-data";

export const analyseOldmarrImportInputSchema = zfd.formData({
  file: zfd.file(),
});
