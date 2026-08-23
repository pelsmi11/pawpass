CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "pet_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "code" varchar(30) NOT NULL UNIQUE,
  "title" varchar(50) NOT NULL
);

CREATE TABLE "pets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(100) NOT NULL,
  "pet_type_id" uuid NOT NULL REFERENCES "pet_types"("id"),
  "age" integer,
  "owner_name" varchar(100) NOT NULL,
  "session_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "pets_age_check" CHECK ("age" IS NULL OR ("age" >= 0 AND "age" <= 100))
);

CREATE INDEX "pets_session_id_idx" ON "pets" USING btree ("session_id");

-- Seeds (idempotent)
INSERT INTO "pet_types" ("id", "code", "title") VALUES
  (gen_random_uuid(), 'DOG', 'Perro'),
  (gen_random_uuid(), 'CAT', 'Gato')
ON CONFLICT ("code") DO UPDATE SET "title" = EXCLUDED."title";
