import 'dotenv/config';
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: [
    './src/db/companiesSchema.ts',
    './src/db/usersSchema.ts',
    './src/db/tasksSchema.ts',
    './src/db/occupationsSchema.ts',
    './src/db/projectsSchema.ts',
    './src/db/groupsSchema.ts',
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});