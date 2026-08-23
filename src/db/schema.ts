import { index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Glossary mapping for pet type identifier:
 * - API JSON: petTypeId (camelCase)
 * - DB column: pet_type_id (snake_case)
 * - Drizzle field: petTypeId (camelCase)
 * This triple mapping is used consistently across validation, queries and API responses.
 */

export const petTypes = pgTable("pet_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 30 }).notNull().unique(),
  title: varchar("title", { length: 50 }).notNull(),
});

export const pets = pgTable(
  "pets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    petTypeId: uuid("pet_type_id")
      .notNull()
      .references(() => petTypes.id),
    age: integer("age"),
    ownerName: varchar("owner_name", { length: 100 }).notNull(),
    sessionId: uuid("session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("pets_session_id_idx").on(table.sessionId)],
);
