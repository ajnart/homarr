import 'dotenv';
import { type Config } from 'drizzle-kit';

console.log(process.env);

export default {
  schema: './src/server/db/schema.ts',
  driver: 'better-sqlite',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
