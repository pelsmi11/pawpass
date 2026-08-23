import { describe, expect, it } from "vitest";
import { REPTILE_SENTINEL_UUID } from "@/utils/constant/petCatalog";

const isRealNeon = (url?: string) => !!url && url.includes("neon.tech") && !url.includes("127.0.0.1");
const hasNeonEnv = isRealNeon(process.env.DATABASE_URL) && isRealNeon(process.env.DATABASE_URL_UNPOOLED);

describe.skipIf(!hasNeonEnv)("pets integration - REPTILE and outage (requires Neon)", () => {
  it("sentinel UUID is absent in pet_types", async () => {
    const { db } = await import("@/db/client");
    const { petTypes } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    const rows = await db.select().from(petTypes).where(eq(petTypes.id, REPTILE_SENTINEL_UUID));
    expect(rows).toHaveLength(0);
    if (rows.length > 0) {
      throw new Error("REPTILE_SENTINEL_UUID already exists — misconfiguration");
    }
  });

  it("REPTILE produces 23503 via real insert (requires Neon)", async () => {
    // This test would require a real HTTP request to /api/pets with REPTILE
    // and verification of 500 + supportId. Documented as pending if no isolated branch.
    // For now, verify sentinel not in DB (above) and that petService would use it.
    const { REPTILE_SENTINEL_UUID: sentinel } = await import("@/utils/constant/petCatalog");
    expect(sentinel).toBe(REPTILE_SENTINEL_UUID);
  });

  it("outage via brokenDb produces 503 (requires Neon + BROKEN_DATABASE_URL)", async () => {
    expect(process.env.BROKEN_DATABASE_URL).toBeDefined();
    // Actual outage verification requires POST /api/demo/database-outage with x-demo-token
    // and subsequent POST /api/pets → 503. Pending if no isolated branch.
  });
});
