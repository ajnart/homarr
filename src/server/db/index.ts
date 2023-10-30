import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { env } from '~/env';

import * as schema from './schema';

export const sqlite = new Database(env.DATABASE_URL?.replace('file:', ''));

export const db = drizzle(sqlite, { schema });
