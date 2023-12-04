import bcrypt from 'bcryptjs';

import Database from 'better-sqlite3';

import boxen from 'boxen';

import chalk from 'chalk';

import Consola from 'consola';

import crypto from 'crypto';

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/better-sqlite3';

export async function resetPasswordForOwner() {
  if (!process.env.DATABASE_URL) {
    Consola.error('Unable to connect to database due to missing database URL environment variable');
    return;
  }

  Consola.info('Connecting to the database...');
  const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
  const db = drizzle(sqlite);

  Consola.info('Connected to the database ' + chalk.green('✓'));
  Consola.info('Generating new random password...');

  const newPassword = crypto.randomUUID();
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);

  try {
    await db.transaction((tx) => {
      tx.run(
        sql`DELETE FROM session WHERE userId = (SELECT id FROM user WHERE is_owner = 1 LIMIT 1)`
      );
      tx.run(sql`UPDATE user SET password = ${hashedPassword} WHERE is_owner = 1 LIMIT 1;`);
    });
    console.log(
      boxen(`New owner password is '${chalk.red(newPassword)}'. You can now log in with this password.\nExising sessions have been destroyed and need to login again with the new passowrd.`, {
        dimBorder: true,
        borderStyle: 'round',
        padding: {
          left: 1,
          right: 1
        }
      })
    );
  } catch (err) {
    Consola.error('Failed to update password', err);
  } finally {
    Consola.info('Command has completed');
  }
}
