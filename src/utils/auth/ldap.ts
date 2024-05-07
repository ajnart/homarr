import Consola from 'consola';
import ldap from 'ldapjs';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { env } from '~/env';
import { signInSchema } from '~/validations/user';

import adapter, { onCreateUser } from './adapter';

// Helper types for infering properties of returned search type
type AttributeConstraint = string | readonly string[] | undefined;

type InferrableSearchOptions<
  Attributes extends AttributeConstraint,
  ArrayAttributes extends Attributes,
> = Omit<ldap.SearchOptions, 'attributes'> & {
  attributes?: Attributes;
  arrayAttributes?: ArrayAttributes;
};

type SearchResultIndex<Attributes extends AttributeConstraint> = Attributes extends string
  ? Attributes
  : Attributes extends readonly string[]
    ? Attributes[number]
    : string;

type SearchResult<
  Attributes extends AttributeConstraint,
  ArrayAttributes extends Attributes = never,
> = { dn: string } & Record<
  Exclude<SearchResultIndex<Attributes>, SearchResultIndex<ArrayAttributes>>,
  string
> &
  Record<SearchResultIndex<ArrayAttributes>, string[]>;

const ldapLogin = (username: string, password: string) =>
  new Promise<ldap.Client>((resolve, reject) => {
    const client = ldap.createClient({
      url: env.AUTH_LDAP_URI,
    });
    client.bind(username, password, (error, res) => {
      if (error) {
        reject('Invalid username or password');
      } else {
        resolve(client);
      }
    });
  });

const ldapSearch = async <
  Attributes extends AttributeConstraint,
  ArrayAttributes extends Attributes = never,
>(
  client: ldap.Client,
  base: string,
  options: InferrableSearchOptions<Attributes, ArrayAttributes>
) =>
  new Promise<SearchResult<Attributes, ArrayAttributes>[]>((resolve, reject) => {
    client.search(base, options as ldap.SearchOptions, (err, res) => {
      const results: SearchResult<Attributes, ArrayAttributes>[] = [];
      res.on('error', (err) => {
        reject('error: ' + err.message);
      });
      res.on('searchEntry', (entry) => {
        let userDn;
        try {
          //dn is the only attribute returned with special characters formatted in UTF-8 (Bad for any letters with an accent)
          //Regex replaces any backslash followed by 2 hex characters with a percentage unless said backslash is preceded by another backslash.
          //That can then be processed by decodeURIComponent which will turn back characters to normal.
          userDn = decodeURIComponent(
            entry.pojo.objectName.replace(/(?<!\\)\\([0-9a-fA-F]{2})/g, '%$1')
          )
        } catch { reject(new Error ('Cannot resolve distinguishedName for the user')) }
        results.push(
          entry.pojo.attributes.reduce<Record<string, string | string[]>>(
            (obj, attr) => {
              // just take first element assuming there's only one (uid, mail), unless in arrayAttributes
              obj[attr.type] = options.arrayAttributes?.includes(attr.type)
                ? attr.values
                : attr.values[0];
              return obj;
            },
            {
              // Assume userDn since there's a reject if not set
              dn: userDn!,
            }
          ) as SearchResult<Attributes, ArrayAttributes>
        );
      });
      res.on('end', (result) => {
        if (result?.status != 0) {
          reject(new Error('ldap search status is not 0, search failed'));
        } else {
          resolve(results);
        }
      });
    });
  });

export default Credentials({
  id: 'ldap',
  name: 'LDAP',
  credentials: {
    name: { label: 'uid', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    try {
      const data = await signInSchema.parseAsync(credentials);

      Consola.log(`user ${data.name} is trying to log in using LDAP. Connecting to LDAP server...`);
      const client = await ldapLogin(env.AUTH_LDAP_BIND_DN, env.AUTH_LDAP_BIND_PASSWORD);

      Consola.log(`Connection established. Searching User...`);
      const ldapUser = (
        await ldapSearch(client, env.AUTH_LDAP_BASE, {
          filter: env.AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG
            ? `(&(${env.AUTH_LDAP_USERNAME_ATTRIBUTE}=${data.name})${env.AUTH_LDAP_USERNAME_FILTER_EXTRA_ARG})`
            : `(${env.AUTH_LDAP_USERNAME_ATTRIBUTE}=${data.name})`,
          scope: env.AUTH_LDAP_SEARCH_SCOPE,
          // as const for inference
          attributes: [
            env.AUTH_LDAP_USERNAME_ATTRIBUTE,
            env.AUTH_LDAP_USER_MAIL_ATTRIBUTE,
          ] as const,
        })
      )[0];

      if (!ldapUser) throw new Error('User not found in LDAP');

      try {
        z.string().email().parse(ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE]);
      } catch {
        throw new Error(
          `User found but with invalid or non-existing Email. Not Supported: "${
            ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE] ?? ' '
          }"`
        );
      }

      Consola.log(`User found. Logging in...`);
      await ldapLogin(ldapUser.dn, data.password).then((client) => client.destroy());

      Consola.log(`User logged in. Retrieving groups...`);
      const userGroups = (
        await ldapSearch(client, env.AUTH_LDAP_BASE, {
          filter: `(&(objectClass=${env.AUTH_LDAP_GROUP_CLASS})(${
            env.AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE
          }=${ldapUser[env.AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE as 'dn' | 'uid']})${
            env.AUTH_LDAP_GROUP_FILTER_EXTRA_ARG ?? ''
          })`,
          scope: env.AUTH_LDAP_SEARCH_SCOPE,
          // as const for inference
          attributes: 'cn',
        })
      ).map((group) => group.cn);

      client.destroy();

      Consola.log(`user ${data.name} successfully authorized`);

      let user = await adapter.getUserByEmail!(ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE]);
      const isOwner = userGroups.includes(env.AUTH_LDAP_OWNER_GROUP);
      const isAdmin = isOwner || userGroups.includes(env.AUTH_LDAP_ADMIN_GROUP);

      if (!user) {
        // CreateUser will create settings in event
        user = adapter.createUser({
          name: ldapUser[env.AUTH_LDAP_USERNAME_ATTRIBUTE],
          email: ldapUser[env.AUTH_LDAP_USER_MAIL_ATTRIBUTE],
          emailVerified: new Date(), // assume ldap email is verified
          isAdmin: isAdmin,
          isOwner: isOwner,
        });
        // For some reason adapter.createUser doesn't call createUser event, needs to be called manually to create usersettings
        await onCreateUser({ user });
      } else if (user.isAdmin != isAdmin || user.isOwner != isOwner) {
        // Update roles if changed in LDAP
        Consola.log(`updating roles of user ${user.name}`);
        adapter.updateUser({
          ...user,
          isAdmin,
          isOwner,
        });
      }

      return {
        id: user?.id || ldapUser.dn,
        name: user?.name || ldapUser[env.AUTH_LDAP_USERNAME_ATTRIBUTE],
        isAdmin: isAdmin,
        isOwner: isOwner,
      };
    } catch (error) {
      Consola.error(error);
      return null;
    }
  },
});
