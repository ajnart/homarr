import { CredentialsSignin } from "@auth/core/errors";
import { z } from "zod/v4";

import { createId } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import type { Database, InferInsertModel } from "@homarr/db";
import { and, eq } from "@homarr/db";
import { users } from "@homarr/db/schema";
import type { ldapSignInSchema } from "@homarr/validation/user";

import { env } from "../../../env";
import { LdapClient } from "../ldap-client";

const logger = createLogger({ module: "ldapAuthorization" });

export const authorizeWithLdapCredentialsAsync = async (
  db: Database,
  credentials: z.infer<typeof ldapSignInSchema>,
) => {
  logger.info("User is trying to log in using LDAP. Connecting to LDAP server...", { userName: credentials.name });
  const client = new LdapClient();
  await client
    .bindAsync({
      distinguishedName: env.AUTH_LDAP_BIND_DN,
      password: env.AUTH_LDAP_BIND_PASSWORD,
    })
    .catch((error) => {
      throw new CredentialsSignin("Failed to connect to LDAP server", { cause: error });
    });

  logger.info("Connected to LDAP server. Searching for user...");

  const ldapUser = await client
    .searchAsync({
      base: env.AUTH_LDAP_BASE,
      options: {
        filter: createLdapUserFilter(credentials.name),
        scope: env.AUTH_LDAP_SEARCH_SCOPE,
        attributes: [env.AUTH_LDAP_USERNAME_ATTRIBUTE, env.AUTH_LDAP_USER_MAIL_ATTRIBUTE],
      },
    })
    .then((entries) => {
      if (entries.length > 1) {
        logger.warn(`Multiple LDAP users found for ${credentials.name}, expected only one.`);
        throw new CredentialsSignin();
      }

      return entries.at(0);
    });

  if (!ldapUser) {
    throw new CredentialsSignin(`User not found in LDAP username="${credentials.name}"`);
  }

  // Validate email
  const mailResult = await z.string().email().safeParseAsync(ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE]);

  if (!mailResult.success) {
    logger.error("User found in LDAP but with invalid or non-existing Email", {
      userName: credentials.name,
      emailValue: ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE],
    });
    throw new CredentialsSignin("User found in LDAP but with invalid or non-existing Email");
  }

  logger.info("User found in LDAP. Logging in...", { userName: credentials.name });

  // Bind with user credentials to check if the password is correct
  const userClient = new LdapClient();
  await userClient
    .bindAsync({
      distinguishedName: ldapUser.dn,
      password: credentials.password,
    })
    .catch(() => {
      logger.warn("Wrong credentials for user", { userName: credentials.name });
      throw new CredentialsSignin();
    });
  await userClient.disconnectAsync();

  logger.info("User credentials are correct. Retrieving user groups...", { userName: credentials.name });

  const userGroups = await client
    .searchAsync({
      base: env.AUTH_LDAP_BASE,
      options: {
        // For example, if the user is doejohn, the filter will be (&(objectClass=group)(uid=doejohn)) or (&(objectClass=group)(uid=doejohn)(sAMAccountType=1234))
        filter: `(&(objectClass=${env.AUTH_LDAP_GROUP_CLASS})(${
          env.AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE
        }=${ldapUser[env.AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE]})${env.AUTH_LDAP_GROUP_FILTER_EXTRA_ARG ?? ""})`,
        scope: env.AUTH_LDAP_SEARCH_SCOPE,
        attributes: ["cn"],
      },
    })
    .then((entries) => entries.map((entry) => entry.cn).filter((group): group is string => group !== undefined));

  logger.info("User groups retrieved", { userName: credentials.name, groups: userGroups.length });

  await client.disconnectAsync();

  // Create or update user in the database
  let user = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      image: true,
      email: true,
      emailVerified: true,
      provider: true,
    },
    where: and(eq(users.email, mailResult.data), eq(users.provider, "ldap")),
  });

  if (!user) {
    logger.info("User not found in the database. Creating...", { userName: credentials.name });

    const insertUser = {
      id: createId(),
      name: credentials.name,
      email: mailResult.data,
      emailVerified: new Date(), // assume email is verified
      image: null,
      provider: "ldap",
    } satisfies InferInsertModel<typeof users>;

    await db.insert(users).values(insertUser);

    user = insertUser;

    logger.info("User created successfully", { userName: credentials.name });
  }

  return {
    id: user.id,
    name: credentials.name,
    // Groups is used in events.ts to synchronize groups with external systems
    groups: userGroups,
  };
};

const createLdapUserFilter = (username: string) => {
  if (env.AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG) {
    // For example, if the username is doejohn and the extra arg is (sAMAccountType=1234), the filter will be (&(uid=doejohn)(sAMAccountType=1234))
    return `(&(${env.AUTH_LDAP_USERNAME_ATTRIBUTE}=${username})${env.AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG})`;
  }

  // For example, if the username is doejohn, the filter will be (uid=doejohn)
  return `(${env.AUTH_LDAP_USERNAME_ATTRIBUTE}=${username})`;
};
