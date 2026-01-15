import { chromium } from "playwright";
import { GenericContainer } from "testcontainers";
import { describe, expect, test } from "vitest";

import { OnboardingActions } from "./shared/actions/onboarding-actions";
import { createHomarrContainer, withLogs } from "./shared/create-homarr-container";
import { createSqliteDbFileAsync } from "./shared/e2e-db";

const defaultCredentials = {
  username: "admin",
  password: "password",
  email: "admin@homarr.dev",
  group: "lldap_admin",
};

const ldapBase = "dc=example,dc=com";

describe("LLDAP authorization", () => {
  test("Authorize with LLDAP successfully", async () => {
    // Arrange
    const lldapContainer = await createLldapContainer().start();
    const { db, localMountPath } = await createSqliteDbFileAsync();
    const homarrContainer = await createHomarrContainer({
      environment: {
        AUTH_PROVIDERS: "ldap",
        AUTH_LDAP_URI: `ldap://host.docker.internal:${lldapContainer.getMappedPort(3890)}`,
        AUTH_LDAP_BASE: ldapBase,
        AUTH_LDAP_BIND_DN: `uid=${defaultCredentials.username},ou=People,${ldapBase}`,
        AUTH_LDAP_BIND_PASSWORD: defaultCredentials.password,
      },
      mounts: {
        "/appdata": localMountPath,
      },
    }).start();

    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const onboardingActions = new OnboardingActions(page, db);
    await onboardingActions.skipOnboardingAsync({
      group: defaultCredentials.group,
    });

    // Act
    await page.goto(`http://${homarrContainer.getHost()}:${homarrContainer.getMappedPort(7575)}/auth/login`);
    await page.getByLabel("Username").fill(defaultCredentials.username);
    await page.getByLabel("Password").fill(defaultCredentials.password);
    await page.locator("css=button[type='submit']").click();

    // Assert
    await page.waitForURL(`http://${homarrContainer.getHost()}:${homarrContainer.getMappedPort(7575)}`);
    const users = await db.query.users.findMany({
      with: {
        groups: {
          with: {
            group: true,
          },
        },
      },
    });
    expect(users).toHaveLength(1);
    const user = users[0]!;
    expect(user).toEqual(
      expect.objectContaining({
        name: defaultCredentials.username,
        email: defaultCredentials.email,
        provider: "ldap",
      }),
    );

    const groups = user.groups.map((g) => g.group.name);
    expect(groups).toContain(defaultCredentials.group);

    // Cleanup
    await browser.close();
    await homarrContainer.stop();
    await lldapContainer.stop();
  }, 120_000);
});

const createLldapContainer = () => {
  return withLogs(
    new GenericContainer("lldap/lldap:stable").withExposedPorts(3890).withEnvironment({
      LLDAP_JWT_SECRET: "REPLACE_WITH_RANDOM",
      LLDAP_KEY_SEED: "REPLACE_WITH_RANDOM",
      LLDAP_LDAP_BASE_DN: ldapBase,
      LLDAP_LDAP_USER_PASS: defaultCredentials.password,
      LLDAP_LDAP_USER_EMAIL: defaultCredentials.email,
    }),
  );
};
