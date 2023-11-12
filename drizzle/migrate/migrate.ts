// This file is used to migrate the database to the current version
// It is run when the docker container starts
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const migrationsFolder = process.argv[2] ?? '../drizzle';

dotenv.config({ path: __dirname + '/../.env' });

const sqlite = new Database(process.env.DATABASE_URL!.replace('file:', ''));

const db = drizzle(sqlite);

const migrateDatabase = async () => {
  await migrate(db, { migrationsFolder });
};

migrateDatabase();
