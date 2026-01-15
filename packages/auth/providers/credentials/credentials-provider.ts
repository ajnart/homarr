import type Credentials from "@auth/core/providers/credentials";

import type { Database } from "@homarr/db";
import { ldapSignInSchema, userSignInSchema } from "@homarr/validation/user";

import { authorizeWithBasicCredentialsAsync } from "./authorization/basic-authorization";
import { authorizeWithLdapCredentialsAsync } from "./authorization/ldap-authorization";

type CredentialsConfiguration = Parameters<typeof Credentials>[0];

export const createCredentialsConfiguration = (db: Database) =>
  ({
    id: "credentials",
    type: "credentials",
    name: "Credentials",
    // eslint-disable-next-line no-restricted-syntax
    async authorize(credentials) {
      const data = await userSignInSchema.parseAsync(credentials);

      return await authorizeWithBasicCredentialsAsync(db, data);
    },
  }) satisfies CredentialsConfiguration;

export const createLdapConfiguration = (db: Database) =>
  ({
    id: "ldap",
    type: "credentials",
    name: "Ldap",
    // eslint-disable-next-line no-restricted-syntax
    async authorize(credentials) {
      const data = await ldapSignInSchema.parseAsync(credentials);
      return await authorizeWithLdapCredentialsAsync(db, data).catch(() => null);
    },
  }) satisfies CredentialsConfiguration;
