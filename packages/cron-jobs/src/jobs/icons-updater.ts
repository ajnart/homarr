import { createId, splitToNChunks, Stopwatch } from "@homarr/common";
import { env } from "@homarr/common/env";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { EVERY_WEEK } from "@homarr/cron-jobs-core/expressions";
import type { InferInsertModel } from "@homarr/db";
import { db, handleTransactionsAsync, inArray, sql } from "@homarr/db";
import { iconRepositories, icons } from "@homarr/db/schema";
import { fetchIconsAsync } from "@homarr/icons";

import { createCronJob } from "../lib";

const logger = createLogger({ module: "iconsUpdaterJobs" });

export const iconsUpdaterJob = createCronJob("iconsUpdater", EVERY_WEEK, {
  runOnStart: true,
  expectedMaximumDurationInMillis: 10 * 1000,
}).withCallback(async () => {
  if (env.NO_EXTERNAL_CONNECTION) return;

  logger.info("Updating icon repository cache...");
  const stopWatch = new Stopwatch();
  const repositoryIconGroups = await fetchIconsAsync();
  const countIcons = repositoryIconGroups
    .map((group) => group.icons.length)
    .reduce((partialSum, arrayLength) => partialSum + arrayLength, 0);
  logger.info("Fetched icons from repositories", {
    repositoryCount: repositoryIconGroups.length,
    iconCount: countIcons,
    duration: stopWatch.getElapsedInHumanWords(),
  });

  const databaseIconRepositories = await db.query.iconRepositories.findMany({
    with: {
      icons: true,
    },
  });

  const skippedChecksums: `${string}.${string}`[] = [];
  let countDeleted = 0;
  let countInserted = 0;

  logger.info("Updating icons in database...");
  stopWatch.reset();

  const newIconRepositories: InferInsertModel<typeof iconRepositories>[] = [];
  const newIcons: InferInsertModel<typeof icons>[] = [];
  const allDbIcons = databaseIconRepositories.flatMap((group) => group.icons);

  for (const repositoryIconGroup of repositoryIconGroups) {
    if (!repositoryIconGroup.success) {
      continue;
    }

    const repositoryInDb = databaseIconRepositories.find(
      (dbIconGroup) => dbIconGroup.slug === repositoryIconGroup.slug,
    );
    const iconRepositoryId: string = repositoryInDb?.id ?? createId();
    if (!repositoryInDb?.id) {
      newIconRepositories.push({
        id: iconRepositoryId,
        slug: repositoryIconGroup.slug,
      });
    }

    const dbIconsInRepository = allDbIcons.filter((icon) => icon.iconRepositoryId === iconRepositoryId);

    for (const icon of repositoryIconGroup.icons) {
      if (dbIconsInRepository.some((dbIcon) => dbIcon.checksum === icon.checksum)) {
        skippedChecksums.push(`${iconRepositoryId}.${icon.checksum}`);
        continue;
      }

      newIcons.push({
        id: createId(),
        checksum: icon.checksum,
        name: icon.fileNameWithExtension,
        url: icon.imageUrl,
        iconRepositoryId,
      });
      countInserted++;
    }
  }

  const deadIcons = allDbIcons.filter(
    (icon) => !skippedChecksums.includes(`${icon.iconRepositoryId}.${icon.checksum}`),
  );

  const deadIconRepositories = databaseIconRepositories.filter(
    (iconRepository) => !repositoryIconGroups.some((group) => group.slug === iconRepository.slug),
  );

  await handleTransactionsAsync(db, {
    async handleAsync(db, schema) {
      await db.transaction(async (transaction) => {
        if (newIconRepositories.length >= 1) {
          await transaction.insert(schema.iconRepositories).values(newIconRepositories);
        }

        if (newIcons.length >= 1) {
          // We only insert 5000 icons at a time to avoid SQLite limitations
          for (const chunck of splitToNChunks(newIcons, Math.ceil(newIcons.length / 5000))) {
            await transaction.insert(schema.icons).values(chunck);
          }
        }
        if (deadIcons.length >= 1) {
          await transaction.delete(schema.icons).where(
            inArray(
              // Combine iconRepositoryId and checksum to allow same icons on different repositories
              sql`concat(${icons.iconRepositoryId}, '.', ${icons.checksum})`,
              deadIcons.map((icon) => `${icon.iconRepositoryId}.${icon.checksum}`),
            ),
          );
        }

        if (deadIconRepositories.length >= 1) {
          await transaction.delete(schema.iconRepositories).where(
            inArray(
              iconRepositories.id,
              deadIconRepositories.map((iconRepository) => iconRepository.id),
            ),
          );
        }

        countDeleted += deadIcons.length;
      });
    },
    handleSync() {
      db.transaction((transaction) => {
        if (newIconRepositories.length >= 1) {
          transaction.insert(iconRepositories).values(newIconRepositories).run();
        }

        if (newIcons.length >= 1) {
          // We only insert 5000 icons at a time to avoid SQLite limitations
          for (const chunck of splitToNChunks(newIcons, Math.ceil(newIcons.length / 5000))) {
            transaction.insert(icons).values(chunck).run();
          }
        }
        if (deadIcons.length >= 1) {
          transaction
            .delete(icons)
            .where(
              inArray(
                // Combine iconRepositoryId and checksum to allow same icons on different repositories
                sql`concat(${icons.iconRepositoryId}, '.', ${icons.checksum})`,
                deadIcons.map((icon) => `${icon.iconRepositoryId}.${icon.checksum}`),
              ),
            )
            .run();
        }

        if (deadIconRepositories.length >= 1) {
          transaction
            .delete(iconRepositories)
            .where(
              inArray(
                iconRepositories.id,
                deadIconRepositories.map((iconRepository) => iconRepository.id),
              ),
            )
            .run();
        }

        countDeleted += deadIcons.length;
      });
    },
  });

  logger.info("Updated icons in database", {
    duration: stopWatch.getElapsedInHumanWords(),
    added: countInserted,
    deleted: countDeleted,
  });
});
