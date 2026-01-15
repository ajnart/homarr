import { eq } from "drizzle-orm";
import type { Page } from "playwright";
import { expect } from "vitest";

import * as sqliteSchema from "../../../packages/db/schema/sqlite";
import { OnboardingStep } from "../../../packages/definitions/src";
import { credentialsAdminGroup } from "../../../packages/definitions/src/group";
import type { SqliteDatabase } from "../e2e-db";

export class OnboardingAssertions {
  private readonly page: Page;
  private readonly db: SqliteDatabase;

  constructor(page: Page, db: SqliteDatabase) {
    this.page = page;
    this.db = db;
  }

  public async assertDbOnboardingStepAsync(expectedStep: OnboardingStep) {
    const onboarding = await this.db.query.onboarding.findFirst();
    expect(onboarding?.step).toEqual(expectedStep);
  }

  public async assertUserAndAdminGroupInsertedAsync(expectedUsername: string) {
    const users = await this.db.query.users.findMany({
      with: {
        groups: {
          with: {
            group: {
              with: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    const user = users.find((u) => u.name === expectedUsername);
    expect(user).toBeDefined();

    const adminGroup = user!.groups.find((g) => g.group.name === credentialsAdminGroup);
    expect(adminGroup).toBeDefined();
    expect(adminGroup!.group.permissions).toEqual([expect.objectContaining({ permission: "admin" })]);
  }

  public async assertExternalGroupInsertedAsync(expectedGroupName: string) {
    const group = await this.db.query.groups.findFirst({
      where: eq(sqliteSchema.groups.name, expectedGroupName),
      with: {
        permissions: true,
      },
    });

    expect(group).toBeDefined();
    expect(group!.permissions).toEqual([expect.objectContaining({ permission: "admin" })]);
  }

  public async assertFinishStepVisibleAsync() {
    await this.page.waitForSelector("text=completed the setup", { timeout: 5000 });
  }
}
