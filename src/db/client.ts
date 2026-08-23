import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

function createDb(url: string) {
  return drizzle(neon(url), { schema });
}

// Pooled HTTP connection for normal app traffic (FR-031)
export const db = createDb(process.env.DATABASE_URL!);

// Helper for tests: allow injecting a mock db
export type Database = ReturnType<typeof createDb>;
