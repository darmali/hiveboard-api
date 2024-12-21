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
    './src/db/projectFilesSechema.ts',
    './src/db/attendancesSchema.ts',
    './src/db/exceptionsSchema.ts',
    './src/db/shiftsSchema.ts',
  ],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});