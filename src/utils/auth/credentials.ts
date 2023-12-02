import bcrypt from 'bcryptjs';
import Consola from 'consola';
import { eq } from 'drizzle-orm';
import Credentials from 'next-auth/providers/credentials';
import { colorSchemeParser, signInSchema } from '~/validations/user';

import { db } from '../../server/db';
import { users } from '../../server/db/schema';

export default Credentials({
  name: 'credentials',
  credentials: {
    name: {
      label: 'Username',
      type: 'text',
    },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    const data = await signInSchema.parseAsync(credentials);

    const user = await db.query.users.findFirst({
      with: {
        settings: {
          columns: {
            colorScheme: true,
            language: true,
            autoFocusSearch: true,
          },
        },
      },
      where: eq(users.name, data.name),
    });

    if (!user || !user.password) {
      return null;
    }

    Consola.log(`user ${user.name} is trying to log in. checking password...`);
    const isValidPassword = await bcrypt.compare(data.password, user.password);

    if (!isValidPassword) {
      Consola.log(`password for user ${user.name} was incorrect`);
      return null;
    }

    Consola.log(`user ${user.name} successfully authorized`);

    return {
      id: user.id,
      name: user.name,
      isAdmin: false,
      isOwner: false,
    };
  },
});
