import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const createDb = (url: string) => {
  return drizzle(neon(url), { schema });
};

// Pooled HTTP connection for normal app traffic (FR-031)
export const db = createDb(process.env.DATABASE_URL!);

let _brokenDb: ReturnType<typeof createDb> | null = null;

export const getBrokenDb = () => {
  if (_brokenDb) return _brokenDb;
  const url = process.env.BROKEN_DATABASE_URL;
  if (!url) {
    const error = new Error("BROKEN_DATABASE_URL not configured") as Error & { code?: string };
    (error as unknown as { code: string }).code = "ECONNREFUSED";
    throw error;
  }
  _brokenDb = createDb(url);
  return _brokenDb;
};

// Helper for tests: allow injecting a mock db
export type Database = ReturnType<typeof createDb>;
