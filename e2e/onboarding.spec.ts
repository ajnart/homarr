import { chromium } from "playwright";
import { describe, test } from "vitest";

import { OnboardingActions } from "./shared/actions/onboarding-actions";
import { OnboardingAssertions } from "./shared/assertions/onboarding-assertions";
import { createHomarrContainer } from "./shared/create-homarr-container";
import { createSqliteDbFileAsync } from "./shared/e2e-db";

describe("Onboarding", () => {
  test("Credentials onboarding should be successful", async () => {
    // Arrange
    const { db, localMountPath } = await createSqliteDbFileAsync();
    const homarrContainer = await createHomarrContainer({
      mounts: {
        "/appdata": localMountPath,
      },
    }).start();

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const actions = new OnboardingActions(page, db);
    const assertions = new OnboardingAssertions(page, db);

    // Act
    await page.goto(`http://${homarrContainer.getHost()}:${homarrContainer.getMappedPort(7575)}`);
    await actions.startOnboardingAsync("scratch");
    await actions.processUserStepAsync({
      username: "admin",
      password: "Comp(exP4sswOrd",
      confirmPassword: "Comp(exP4sswOrd",
    });
    await actions.processSettingsStepAsync();

    // Assert
    await assertions.assertFinishStepVisibleAsync();
    await assertions.assertUserAndAdminGroupInsertedAsync("admin");
    await assertions.assertDbOnboardingStepAsync("finish");

    // Cleanup
    await browser.close();
    await homarrContainer.stop();
  }, 60_000);

  test("External provider onboarding setup should be successful", async () => {
    // Arrange
    const { db, localMountPath } = await createSqliteDbFileAsync();
    const homarrContainer = await createHomarrContainer({
      environment: {
        AUTH_PROVIDERS: "ldap",
        AUTH_LDAP_URI: "ldap://host.docker.internal:3890",
        AUTH_LDAP_BASE: "not-used",
        AUTH_LDAP_BIND_DN: "not-used",
        AUTH_LDAP_BIND_PASSWORD: "not-used",
      },
      mounts: {
        "/appdata": localMountPath,
      },
    }).start();
    const externalGroupName = "oidc-admins";

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const actions = new OnboardingActions(page, db);
    const assertions = new OnboardingAssertions(page, db);

    // Act
    await page.goto(`http://${homarrContainer.getHost()}:${homarrContainer.getMappedPort(7575)}`);
    await actions.startOnboardingAsync("scratch");
    await actions.processExternalGroupStepAsync({
      name: externalGroupName,
    });
    await actions.processSettingsStepAsync();

    // Assert
    await assertions.assertFinishStepVisibleAsync();
    await assertions.assertExternalGroupInsertedAsync(externalGroupName);
    await assertions.assertDbOnboardingStepAsync("finish");

    // Cleanup
    await browser.close();
    await homarrContainer.stop();
  }, 60_000);
});
