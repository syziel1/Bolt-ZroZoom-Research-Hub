


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, nick, name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'full_name',
    'student'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_reputation_on_resource_add"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE profiles
  SET reputation_score = reputation_score + 10
  WHERE id = NEW.contributor_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."increment_reputation_on_resource_add"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("uid" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = uid
      AND p.role = 'admin'
  );
$$;


ALTER FUNCTION "public"."is_admin"("uid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    level1_order integer;
    level2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO level1_order FROM public.levels WHERE id = level1_id;
    SELECT order_index INTO level2_order FROM public.levels WHERE id = level2_id;
    
    -- Check if levels exist
    IF level1_order IS NULL OR level2_order IS NULL THEN
        RAISE EXCEPTION 'One or both levels not found';
    END IF;
    
    -- Perform atomic swap
    UPDATE public.levels SET order_index = -1 WHERE id = level1_id;
    UPDATE public.levels SET order_index = level1_order WHERE id = level2_id;
    UPDATE public.levels SET order_index = level2_order WHERE id = level1_id;
END;
$$;


ALTER FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") IS 'Atomically swaps order_index between two levels, eliminating race conditions';



CREATE OR REPLACE FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    subject1_order integer;
    subject2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO subject1_order FROM public.subjects WHERE id = subject1_id;
    SELECT order_index INTO subject2_order FROM public.subjects WHERE id = subject2_id;
    
    -- Check if subjects exist
    IF subject1_order IS NULL OR subject2_order IS NULL THEN
        RAISE EXCEPTION 'One or both subjects not found';
    END IF;
    
    -- Perform atomic swap
    UPDATE public.subjects SET order_index = -1 WHERE id = subject1_id;
    UPDATE public.subjects SET order_index = subject1_order WHERE id = subject2_id;
    UPDATE public.subjects SET order_index = subject2_order WHERE id = subject1_id;
END;
$$;


ALTER FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") IS 'Atomically swaps order_index between two subjects, eliminating race conditions';



CREATE OR REPLACE FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
    topic1_order integer;
    topic2_order integer;
BEGIN
    -- Get current order indices
    SELECT order_index INTO topic1_order FROM public.topics WHERE id = topic1_id;
    SELECT order_index INTO topic2_order FROM public.topics WHERE id = topic2_id;
    
    -- Check if topics exist
    IF topic1_order IS NULL OR topic2_order IS NULL THEN
        RAISE EXCEPTION 'One or both topics not found';
    END IF;
    
    -- Perform atomic swap using a transaction
    -- Step 1: Set first topic to temporary value to avoid unique constraint conflicts
    UPDATE public.topics SET order_index = -1 WHERE id = topic1_id;
    
    -- Step 2: Set second topic to first topic's original order
    UPDATE public.topics SET order_index = topic1_order WHERE id = topic2_id;
    
    -- Step 3: Set first topic to second topic's original order
    UPDATE public.topics SET order_index = topic2_order WHERE id = topic1_id;
    
    -- Transaction commits automatically if no errors
END;
$$;


ALTER FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") IS 'Atomically swaps order_index between two topics, eliminating race conditions';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "parent_comment_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."levels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."levels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "nick" "text",
    "name" "text",
    "role" "text" DEFAULT 'student'::"text",
    "reputation_score" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "rating_usefulness" integer NOT NULL,
    "rating_correctness" integer NOT NULL,
    "difficulty_match" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ratings_correctness_range" CHECK ((("rating_correctness" >= 1) AND ("rating_correctness" <= 5))),
    CONSTRAINT "ratings_difficulty_range" CHECK ((("difficulty_match" IS NULL) OR (("difficulty_match" >= 1) AND ("difficulty_match" <= 5)))),
    CONSTRAINT "ratings_usefulness_range" CHECK ((("rating_usefulness" >= 1) AND ("rating_usefulness" <= 5)))
);


ALTER TABLE "public"."ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_levels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "level_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resource_levels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "topic_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resource_topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "author" "text",
    "url" "text" NOT NULL,
    "type" "text" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "contributor_id" "uuid" NOT NULL,
    "embedded" boolean DEFAULT false,
    "description" "text",
    "language" "text" DEFAULT 'pl'::"text",
    "ai_generated" boolean DEFAULT false,
    "review_required" boolean DEFAULT false,
    "review_status" "text" DEFAULT 'unreviewed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "thumbnail_path" "text",
    "thumbnail_url" "text",
    CONSTRAINT "review_status_valid" CHECK (("review_status" = ANY (ARRAY['unreviewed'::"text", 'in_review'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


COMMENT ON COLUMN "public"."resources"."thumbnail_url" IS 'External thumbnail URL (e.g., from YouTube or other sources)';



CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "parent_topic_id" "uuid",
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_favorites" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_resource_levels" WITH ("security_invoker"='on') AS
 SELECT "r"."id" AS "resource_id",
    "jsonb_agg"("jsonb_build_object"('id', "l"."id", 'name', "l"."name", 'slug', "l"."slug", 'order_index', "l"."order_index") ORDER BY "l"."order_index") AS "levels"
   FROM (("public"."resources" "r"
     LEFT JOIN "public"."resource_levels" "rl" ON (("rl"."resource_id" = "r"."id")))
     LEFT JOIN "public"."levels" "l" ON (("l"."id" = "rl"."level_id")))
  GROUP BY "r"."id";


ALTER VIEW "public"."v_resource_levels" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_resource_topics" WITH ("security_invoker"='on') AS
 SELECT "rt"."resource_id",
    "t"."id" AS "topic_id",
    "t"."name" AS "topic_name",
    "t"."slug" AS "topic_slug",
    "t"."parent_topic_id",
    "t"."order_index",
    "s"."id" AS "subject_id",
    "s"."name" AS "subject_name",
    "s"."slug" AS "subject_slug"
   FROM (("public"."resource_topics" "rt"
     JOIN "public"."topics" "t" ON (("t"."id" = "rt"."topic_id")))
     JOIN "public"."subjects" "s" ON (("s"."id" = "t"."subject_id")));


ALTER VIEW "public"."v_resource_topics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_resources_full" WITH ("security_invoker"='on') AS
 SELECT "r"."id",
    "r"."title",
    "r"."author",
    "r"."url",
    "r"."type",
    "r"."subject_id",
    "r"."contributor_id",
    "r"."description",
    "r"."language",
    "r"."created_at",
    "r"."updated_at",
    "r"."thumbnail_path",
    "r"."thumbnail_url",
    "s"."name" AS "subject_name",
    COALESCE("round"("avg"("ratings"."rating_usefulness"), 1), NULL::numeric) AS "avg_usefulness",
    COALESCE("round"("avg"("ratings"."rating_correctness"), 1), NULL::numeric) AS "avg_correctness",
    COALESCE("round"("avg"("ratings"."difficulty_match"), 1), NULL::numeric) AS "avg_difficulty",
    "count"(DISTINCT "ratings"."id") AS "rating_count",
    "count"(DISTINCT "comments"."id") AS "comment_count"
   FROM ((("public"."resources" "r"
     LEFT JOIN "public"."subjects" "s" ON (("r"."subject_id" = "s"."id")))
     LEFT JOIN "public"."ratings" ON (("r"."id" = "ratings"."resource_id")))
     LEFT JOIN "public"."comments" ON (("r"."id" = "comments"."resource_id")))
  GROUP BY "r"."id", "r"."title", "r"."author", "r"."url", "r"."type", "r"."subject_id", "r"."contributor_id", "r"."description", "r"."language", "r"."created_at", "r"."updated_at", "r"."thumbnail_path", "r"."thumbnail_url", "s"."name";


ALTER VIEW "public"."v_resources_full" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_subjects_basic" AS
SELECT
    NULL::"uuid" AS "subject_id",
    NULL::"text" AS "subject_name",
    NULL::"text" AS "subject_slug",
    NULL::integer AS "order_index",
    NULL::bigint AS "topics_count";


ALTER VIEW "public"."v_subjects_basic" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_topics_tree" WITH ("security_invoker"='on') AS
 SELECT "t"."id",
    "t"."subject_id",
    "s"."name" AS "subject_name",
    "s"."slug" AS "subject_slug",
    "t"."name",
    "t"."slug",
    "t"."order_index",
    "t"."parent_topic_id",
    "pt"."name" AS "parent_name",
    "pt"."slug" AS "parent_slug"
   FROM (("public"."topics" "t"
     JOIN "public"."subjects" "s" ON (("s"."id" = "t"."subject_id")))
     LEFT JOIN "public"."topics" "pt" ON (("pt"."id" = "t"."parent_topic_id")))
  ORDER BY "s"."order_index", "t"."parent_topic_id" NULLS FIRST, "t"."order_index";


ALTER VIEW "public"."v_topics_tree" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_unique_per_user_resource" UNIQUE ("resource_id", "author_id");



ALTER TABLE ONLY "public"."resource_levels"
    ADD CONSTRAINT "resource_levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_topics"
    ADD CONSTRAINT "resource_topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "unique_user_resource" UNIQUE ("user_id", "resource_id");



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_pkey" PRIMARY KEY ("id");



CREATE INDEX "comments_author_idx" ON "public"."comments" USING "btree" ("author_id");



CREATE INDEX "comments_resource_idx" ON "public"."comments" USING "btree" ("resource_id");



CREATE INDEX "idx_user_favorites_resource_id" ON "public"."user_favorites" USING "btree" ("resource_id");



CREATE INDEX "idx_user_favorites_user_created" ON "public"."user_favorites" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_user_favorites_user_id" ON "public"."user_favorites" USING "btree" ("user_id");



CREATE UNIQUE INDEX "levels_slug_unique" ON "public"."levels" USING "btree" ("slug");



CREATE INDEX "ratings_author_idx" ON "public"."ratings" USING "btree" ("author_id");



CREATE INDEX "ratings_resource_idx" ON "public"."ratings" USING "btree" ("resource_id");



CREATE UNIQUE INDEX "resource_levels_unique" ON "public"."resource_levels" USING "btree" ("resource_id", "level_id");



CREATE UNIQUE INDEX "resource_topics_unique" ON "public"."resource_topics" USING "btree" ("resource_id", "topic_id");



CREATE INDEX "resources_ai_review_idx" ON "public"."resources" USING "btree" ("ai_generated", "review_status");



CREATE INDEX "resources_contributor_idx" ON "public"."resources" USING "btree" ("contributor_id");



CREATE INDEX "resources_subject_idx" ON "public"."resources" USING "btree" ("subject_id");



CREATE INDEX "resources_type_idx" ON "public"."resources" USING "btree" ("type");



CREATE UNIQUE INDEX "subjects_slug_unique" ON "public"."subjects" USING "btree" ("slug");



CREATE UNIQUE INDEX "topics_subject_slug_unique" ON "public"."topics" USING "btree" ("subject_id", "slug");



CREATE OR REPLACE VIEW "public"."v_subjects_basic" WITH ("security_invoker"='true') AS
 SELECT "s"."id" AS "subject_id",
    "s"."name" AS "subject_name",
    "s"."slug" AS "subject_slug",
    "s"."order_index",
    "count"(DISTINCT "t"."id") AS "topics_count"
   FROM ("public"."subjects" "s"
     LEFT JOIN "public"."topics" "t" ON (("t"."subject_id" = "s"."id")))
  GROUP BY "s"."id"
  ORDER BY "s"."order_index";



CREATE OR REPLACE TRIGGER "on_resource_created" AFTER INSERT ON "public"."resources" FOR EACH ROW EXECUTE FUNCTION "public"."increment_reputation_on_resource_add"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ratings"
    ADD CONSTRAINT "ratings_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_levels"
    ADD CONSTRAINT "resource_levels_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_levels"
    ADD CONSTRAINT "resource_levels_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_topics"
    ADD CONSTRAINT "resource_topics_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_topics"
    ADD CONSTRAINT "resource_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_parent_topic_id_fkey" FOREIGN KEY ("parent_topic_id") REFERENCES "public"."topics"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_favorites"
    ADD CONSTRAINT "user_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Comments - delete own" ON "public"."comments" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id")));



CREATE POLICY "Comments - insert own" ON "public"."comments" FOR INSERT WITH CHECK (("author_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Comments - public read" ON "public"."comments" FOR SELECT USING (true);



CREATE POLICY "Comments - update own" ON "public"."comments" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id"))) WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id")));



CREATE POLICY "Levels - admin all" ON "public"."levels" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Levels - public read" ON "public"."levels" FOR SELECT USING (true);



CREATE POLICY "Levels - service role modify" ON "public"."levels" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Profiles - insert own" ON "public"."profiles" FOR INSERT WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Profiles - public read" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Profiles - update own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Ratings - delete own" ON "public"."ratings" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id")));



CREATE POLICY "Ratings - insert own" ON "public"."ratings" FOR INSERT WITH CHECK (("author_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Ratings - public read" ON "public"."ratings" FOR SELECT USING (true);



CREATE POLICY "Ratings - update own" ON "public"."ratings" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id"))) WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "author_id")));



CREATE POLICY "ResourceLevels - modify by contributor" ON "public"."resource_levels" USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "resource_levels"."resource_id") AND ("r"."contributor_id" = "auth"."uid"())))))) WITH CHECK (("resource_id" IN ( SELECT "resources"."id"
   FROM "public"."resources"
  WHERE ("resources"."contributor_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "ResourceLevels - public read" ON "public"."resource_levels" FOR SELECT USING (true);



CREATE POLICY "ResourceTopics - modify by contributor" ON "public"."resource_topics" USING ((("auth"."role"() = 'authenticated'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "resource_topics"."resource_id") AND ("r"."contributor_id" = "auth"."uid"())))))) WITH CHECK (("resource_id" IN ( SELECT "resources"."id"
   FROM "public"."resources"
  WHERE ("resources"."contributor_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "ResourceTopics - public read" ON "public"."resource_topics" FOR SELECT USING (true);



CREATE POLICY "Resources - delete own" ON "public"."resources" FOR DELETE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "contributor_id")));



CREATE POLICY "Resources - insert by authenticated" ON "public"."resources" FOR INSERT WITH CHECK (("contributor_id" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Resources - public read" ON "public"."resources" FOR SELECT USING (true);



CREATE POLICY "Resources - update own" ON "public"."resources" FOR UPDATE USING ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "contributor_id"))) WITH CHECK ((("auth"."role"() = 'authenticated'::"text") AND ("auth"."uid"() = "contributor_id")));



CREATE POLICY "Subjects - admin all" ON "public"."subjects" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Subjects - public read" ON "public"."subjects" FOR SELECT USING (true);



CREATE POLICY "Subjects - service role modify" ON "public"."subjects" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Topics - admin all" ON "public"."topics" USING (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text")))) WITH CHECK (("auth"."uid"() IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = 'admin'::"text"))));



CREATE POLICY "Topics - public read" ON "public"."topics" FOR SELECT USING (true);



CREATE POLICY "Topics - service role modify" ON "public"."topics" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can add their own favorites" ON "public"."user_favorites" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own favorites" ON "public"."user_favorites" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own favorites" ON "public"."user_favorites" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ratings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_levels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_favorites" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_reputation_on_resource_add"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_reputation_on_resource_add"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_reputation_on_resource_add"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("uid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."swap_levels_order"("level1_id" "uuid", "level2_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."swap_subjects_order"("subject1_id" "uuid", "subject2_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."swap_topics_order"("topic1_id" "uuid", "topic2_id" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."levels" TO "anon";
GRANT ALL ON TABLE "public"."levels" TO "authenticated";
GRANT ALL ON TABLE "public"."levels" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."ratings" TO "anon";
GRANT ALL ON TABLE "public"."ratings" TO "authenticated";
GRANT ALL ON TABLE "public"."ratings" TO "service_role";



GRANT ALL ON TABLE "public"."resource_levels" TO "anon";
GRANT ALL ON TABLE "public"."resource_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."resource_levels" TO "service_role";



GRANT ALL ON TABLE "public"."resource_topics" TO "anon";
GRANT ALL ON TABLE "public"."resource_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."resource_topics" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON TABLE "public"."user_favorites" TO "anon";
GRANT ALL ON TABLE "public"."user_favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."user_favorites" TO "service_role";



GRANT ALL ON TABLE "public"."v_resource_levels" TO "anon";
GRANT ALL ON TABLE "public"."v_resource_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."v_resource_levels" TO "service_role";



GRANT ALL ON TABLE "public"."v_resource_topics" TO "anon";
GRANT ALL ON TABLE "public"."v_resource_topics" TO "authenticated";
GRANT ALL ON TABLE "public"."v_resource_topics" TO "service_role";



GRANT ALL ON TABLE "public"."v_resources_full" TO "anon";
GRANT ALL ON TABLE "public"."v_resources_full" TO "authenticated";
GRANT ALL ON TABLE "public"."v_resources_full" TO "service_role";



GRANT ALL ON TABLE "public"."v_subjects_basic" TO "anon";
GRANT ALL ON TABLE "public"."v_subjects_basic" TO "authenticated";
GRANT ALL ON TABLE "public"."v_subjects_basic" TO "service_role";



GRANT ALL ON TABLE "public"."v_topics_tree" TO "anon";
GRANT ALL ON TABLE "public"."v_topics_tree" TO "authenticated";
GRANT ALL ON TABLE "public"."v_topics_tree" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































