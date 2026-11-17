import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `prisma generate` runs during deployment builds and does not connect to
    // the database. Avoid making config loading fail when build-time env vars
    // are unavailable; database commands still require a real URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
