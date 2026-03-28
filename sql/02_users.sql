-- ! sql/02_users.sql
-- Users table
--
-- Responsibilities:
-- - Store core user account data
-- - Support local authentication
-- - Act as the base identity record for linked OAuth providers later
--
-- Notes:
-- - Uses UUID primary keys via pgcrypto
-- - Email uniqueness should be enforced
-- - Username uniqueness is enforced only when username exists
-- - updated_at must be maintained by application code unless a trigger is added later
CREATE TABLE
    IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        "email" TEXT NOT NULL,
        "username" TEXT NULL,
        "username_normalized" TEXT NULL,
        "hashed_password" TEXT NULL,
        "is_verified" BOOLEAN NOT NULL DEFAULT FALSE,
        "locale" VARCHAR(10) NOT NULL DEFAULT 'en',
        "last_signin_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW (),
        CONSTRAINT "users_email_unique" UNIQUE ("email"),
        CONSTRAINT "users_username_unique" UNIQUE ("username")
    );

CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email");

CREATE INDEX IF NOT EXISTS "IDX_users_username_normalized" ON "users" ("username_normalized");

CREATE INDEX IF NOT EXISTS "IDX_users_created_at" ON "users" ("created_at");
