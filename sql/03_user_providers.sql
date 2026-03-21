-- ! sql/03_user_providers.sql

-- User OAuth providers table
--
-- Responsibilities:
-- - Link a user account to external authentication providers
-- - Support multiple providers per user (Google, GitHub, Discord, etc.)
-- - Enforce uniqueness between each external provider account and one local user
--
-- Notes:
-- - Uses PostgreSQL ENUM for provider type
-- - One user can have at most one account per provider
-- - One external provider account can belong to only one user

-- Create enum type for providers
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
		CREATE TYPE auth_provider AS ENUM ('google', 'github', 'discord');
	END IF;
END$$;

CREATE TABLE IF NOT EXISTS "user_providers" (
	"user_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
	"provider" auth_provider NOT NULL,
	"provider_user_id" TEXT NOT NULL,

	"created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "user_providers_pkey" PRIMARY KEY ("provider", "provider_user_id"),
	CONSTRAINT "user_providers_user_id_provider_unique" UNIQUE ("user_id", "provider")
);

CREATE INDEX IF NOT EXISTS "IDX_user_providers_user_id"
	ON "user_providers" ("user_id");

CREATE INDEX IF NOT EXISTS "IDX_user_providers_provider"
	ON "user_providers" ("provider");

CREATE INDEX IF NOT EXISTS "IDX_user_providers_created_at"
	ON "user_providers" ("created_at");
