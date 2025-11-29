-- Migration: Create jungle_sessions table for Matematyczna Dżungla game
-- This table stores game sessions for the jungle math game

CREATE TABLE IF NOT EXISTS "public"."jungle_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "level" integer NOT NULL DEFAULT 1,
    "total_questions" integer NOT NULL DEFAULT 10,
    "current_question_index" integer NOT NULL DEFAULT 1,
    "correct_answers" integer NOT NULL DEFAULT 0,
    "status" text NOT NULL DEFAULT 'active',
    "current_question" jsonb,
    "score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone,
    CONSTRAINT "jungle_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "jungle_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
    CONSTRAINT "jungle_sessions_level_check" CHECK (("level" >= 1) AND ("level" <= 3)),
    CONSTRAINT "jungle_sessions_status_check" CHECK ("status" IN ('active', 'finished', 'aborted'))
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "idx_jungle_sessions_user_id" ON "public"."jungle_sessions" USING "btree" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_jungle_sessions_status" ON "public"."jungle_sessions" USING "btree" ("status");
CREATE INDEX IF NOT EXISTS "idx_jungle_sessions_user_status" ON "public"."jungle_sessions" USING "btree" ("user_id", "status");

-- Enable Row Level Security
ALTER TABLE "public"."jungle_sessions" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own sessions
CREATE POLICY "Users can view their own jungle sessions"
    ON "public"."jungle_sessions"
    FOR SELECT
    USING ((SELECT auth.uid()) = "user_id");

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can create their own jungle sessions"
    ON "public"."jungle_sessions"
    FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update their own jungle sessions"
    ON "public"."jungle_sessions"
    FOR UPDATE
    USING ((SELECT auth.uid()) = "user_id")
    WITH CHECK ((SELECT auth.uid()) = "user_id");

-- Grant permissions
GRANT ALL ON TABLE "public"."jungle_sessions" TO "anon";
GRANT ALL ON TABLE "public"."jungle_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."jungle_sessions" TO "service_role";

-- Comment on table
COMMENT ON TABLE "public"."jungle_sessions" IS 'Game sessions for Matematyczna Dżungla math game';
