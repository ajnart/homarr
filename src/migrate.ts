// This file is used to migrate the database to the current version
// It is run when the docker container starts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('sqlite.db');

const db = drizzle(sqlite);

const migrateDatabase = async () => {
  await migrate(db, { migrationsFolder: './drizzle' });
};

migrateDatabase();
