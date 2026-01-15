import { createId } from "@paralleldrive/cuid2";
import type { Page } from "playwright";

import * as sqliteSchema from "../../../packages/db/schema/sqlite";
import type { SqliteDatabase } from "../e2e-db";

export class OnboardingActions {
  private readonly page: Page;
  private readonly db: SqliteDatabase;

  constructor(page: Page, db: SqliteDatabase) {
    this.page = page;
    this.db = db;
  }

  public async skipOnboardingAsync(input?: { group?: string }) {
    await this.db.update(sqliteSchema.onboarding).set({
      step: "finish",
    });

    if (input?.group) {
      await this.db.insert(sqliteSchema.groups).values({
        id: createId(),
        name: input.group,
        position: 1,
      });
    }
  }

  public async startOnboardingAsync(type: "scratch" | "before 1.0") {
    await this.page.locator("button", { hasText: type }).click();
  }

  public async processUserStepAsync(input: { username: string; password: string; confirmPassword: string }) {
    await this.page.waitForSelector("text=administrator user");

    await this.page.getByLabel("Username").fill(input.username);
    await this.page.getByLabel("Password", { exact: true }).fill(input.password);
    await this.page.getByLabel("Confirm password").fill(input.confirmPassword);

    await this.page.locator("css=button[type='submit']").click();
  }

  public async processExternalGroupStepAsync(input: { name: string }) {
    await this.page.waitForSelector("text=external provider");
    await this.page.locator("input").fill(input.name);
    await this.page.locator("css=button[type='submit']").click();
  }

  public async processSettingsStepAsync() {
    await this.page.waitForSelector("text=Analytics");
    await this.page.locator("css=button[type='submit']").click();
  }
}
