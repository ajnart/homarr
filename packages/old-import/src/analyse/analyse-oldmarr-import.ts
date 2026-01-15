import AdmZip from "adm-zip";
import { z } from "zod/v4";

import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import { oldmarrConfigSchema } from "@homarr/old-schema";

import { oldmarrImportUserSchema } from "../user-schema";
import type { analyseOldmarrImportInputSchema } from "./input";

const logger = createLogger({ module: "analyseOldmarrImport" });

export const analyseOldmarrImportForRouterAsync = async (input: z.infer<typeof analyseOldmarrImportInputSchema>) => {
  const { configs, checksum, users } = await analyseOldmarrImportAsync(input.file);

  return {
    configs,
    checksum,
    userCount: users.length,
  };
};

export const analyseOldmarrImportAsync = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const zip = new AdmZip(Buffer.from(arrayBuffer));
  const entries = zip.getEntries();
  const configEntries = entries.filter((entry) => entry.entryName.endsWith(".json") && !entry.entryName.includes("/"));
  const configs = configEntries.map((entry) => {
    const result = oldmarrConfigSchema.safeParse(JSON.parse(entry.getData().toString()));
    if (!result.success) {
      logger.error(
        new ErrorWithMetadata(
          "Failed to parse oldmarr config",
          { entryName: entry.entryName },
          { cause: result.error },
        ),
      );
    }

    return {
      name: entry.name.replaceAll(" ", "-").replace(".json", ""),
      config: result.data ?? null,
      isError: !result.success,
    };
  });

  const userEntry = entries.find((entry) => entry.entryName === "users/users.json");
  const users = parseUsers(userEntry);

  const checksum = entries
    .find((entry) => entry.entryName === "checksum.txt")
    ?.getData()
    .toString("utf-8");

  return {
    configs,
    users,
    checksum,
  };
};

export type AnalyseResult = Awaited<ReturnType<typeof analyseOldmarrImportForRouterAsync>>;

const parseUsers = (entry: AdmZip.IZipEntry | undefined) => {
  if (!entry) return [];

  const result = z.array(oldmarrImportUserSchema).safeParse(JSON.parse(entry.getData().toString()));
  if (!result.success) {
    logger.error(new Error("Failed to parse users", { cause: result.error }));
  }

  return result.data ?? [];
};
