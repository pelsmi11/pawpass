CREATE TABLE "demo_config" (
  "id" varchar(30) PRIMARY KEY NOT NULL,
  "database_outage" boolean NOT NULL DEFAULT false,
  "high_latency" boolean NOT NULL DEFAULT false,
  "latency_ms" integer NOT NULL DEFAULT 6000,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "demo_config_id_check" CHECK (id = 'global')
);

-- Seed single global row (idempotent)
INSERT INTO "demo_config" ("id", "database_outage", "high_latency", "latency_ms") VALUES
  ('global', false, false, 6000)
ON CONFLICT ("id") DO NOTHING;
