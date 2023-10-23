import Consola from 'consola';
import ldap from 'ldapjs';
import Credentials from 'next-auth/providers/credentials';
import { signInSchema } from '~/validations/user';

import { env } from '~/env';
import adapter from './adapter';


// Helper types for infering properties of returned search type
type AttributeContraint = string | readonly string[] | undefined;

type InferrableSearchOptions<A extends AttributeContraint, F extends A> = Omit<
  ldap.SearchOptions,
  'attributes'
> & {
  attributes?: A;
  arrayAttributes?: F;
};

type SearchResultIndex<A extends AttributeContraint> = A extends string
  ? A
  : A extends readonly string[]
  ? A[number]
  : string;

type SearchResult<A extends AttributeContraint, F extends A = never> = { dn: string } & Record<
  Exclude<SearchResultIndex<A>, SearchResultIndex<F>>,
  string
> &
  Record<SearchResultIndex<F>, string[]>;

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

const ldapSearch = async <A extends AttributeContraint, F extends A = never>(
  client: ldap.Client,
  base: string,
  options: InferrableSearchOptions<A, F>
) =>
  new Promise<SearchResult<A, F>[]>((resolve, reject) => {
    client.search(base, options as ldap.SearchOptions, (err, res) => {
      const results: SearchResult<A, F>[] = [];
      res.on('error', (err) => {
        reject('error: ' + err.message);
      });
      res.on('searchEntry', (entry) => {
        results.push(
          entry.pojo.attributes.reduce<Record<string, string | string[]>>(
            (obj, attr) => {
              // just take first element assuming there's only one (uid, mail), unless in arrayAttributes
              obj[attr.type] = options.arrayAttributes?.includes(attr.type) ? attr.values : attr.values[0];
              return obj;
            },
            { dn: entry.pojo.objectName }
          ) as SearchResult<A,F>
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
      
      Consola.log(`user ${data.name} is trying to log in using LDAP. Signing in...`);
      const client = await ldapLogin(env.AUTH_LDAP_BIND_DN, env.AUTH_LDAP_BIND_PASSWORD);

      const ldapUser = (await ldapSearch(client, env.AUTH_LDAP_BASE, {
        filter: `(uid=${data.name})`,
        // as const for inference
        attributes: ['uid', 'mail'] as const
      }))[0];

      await ldapLogin(ldapUser.dn, data.password).then(client => client.destroy())

      const userGroups = (await ldapSearch(client, env.AUTH_LDAP_BASE, {
        filter: `(&(objectclass=${env.AUTH_LDAP_GROUP_CLASS})(${env.AUTH_LDAP_GROUP_MEMBER_ATTRIBUTE}=${ldapUser[env.AUTH_LDAP_GROUP_MEMBER_USER_ATTRIBUTE as "dn" | "uid"]}))`,
        // as const for inference
        attributes: "cn"
      })).map(group => group.cn);

      client.destroy()
      
      Consola.log(`user ${data.name} successfully authorized`);

      let user = await adapter.getUserByEmail!(ldapUser.mail);
      const isAdmin = userGroups.includes(env.AUTH_LDAP_ADMIN_GROUP)
      const isOwner = userGroups.includes(env.AUTH_LDAP_OWNER_GROUP)

      if (!user) {
        // CreateUser will create settings in event 
        user = await adapter.createUser!({
          name: ldapUser.uid,
          email: ldapUser.mail,
          emailVerified: new Date(), // assume ldap email is verified
          isAdmin: isAdmin,
          isOwner: isOwner,
        })
      } else if (user.isAdmin != isAdmin || user.isOwner != isOwner) {
        // Update roles if changed in LDAP
        Consola.log(`updating roles of user ${user.name}`);
        adapter.updateUser!({
          ...user,
          isAdmin,
          isOwner
        })
      }

      return {
        id: user?.id || ldapUser.dn,
        name: user?.name || ldapUser.uid,
        isAdmin: isAdmin,
        isOwner: isOwner,
      };
    } catch (e) {
      Consola.error(e);
      return null
    }
  },
});
