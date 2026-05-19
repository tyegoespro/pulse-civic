-- ============================================================================
-- Pulse Database Schema (idempotent)
-- Run this in the Supabase SQL editor — safe to re-run on existing projects.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PROFILES — extends auth.users with public-facing fields
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name text,
  bio text,
  avatar text,
  is_verified boolean DEFAULT false,
  verified_at timestamptz,
  city text DEFAULT 'Oshkosh',
  state text DEFAULT 'WI',
  is_pro boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Migrate any pre-existing timestamp columns to timestamptz (idempotent).
ALTER TABLE profiles ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';
ALTER TABLE profiles ALTER COLUMN verified_at TYPE timestamptz USING verified_at AT TIME ZONE 'UTC';

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_pro boolean DEFAULT false;

-- Auto-create a profile row whenever a new auth.users row appears.
-- Pulls display_name from OAuth metadata (Google) or falls back to email prefix.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar, is_verified)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    -- Phase 1: everyone is "verified" by default. Replace with real
    -- verification gate (phone+ZIP) before App Store launch.
    true
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- POSTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  location_label text,
  lat float,
  lng float,
  is_incognito boolean DEFAULT false,
  vote_count int DEFAULT 0,
  comment_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE posts ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- New columns for Question Pulses + State scope
ALTER TABLE posts ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'statement';
ALTER TABLE posts ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'local';

-- Enforce valid values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_type_check') THEN
    ALTER TABLE posts ADD CONSTRAINT posts_type_check
      CHECK (type IN ('statement', 'question'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'posts_scope_check') THEN
    ALTER TABLE posts ADD CONSTRAINT posts_scope_check
      CHECK (scope IN ('local', 'state'));
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS posts_scope_created_idx ON posts (scope, created_at DESC);
CREATE INDEX IF NOT EXISTS posts_scope_votes_idx ON posts (scope, vote_count DESC);

-- ----------------------------------------------------------------------------
-- VOTES (on posts)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  direction int CHECK (direction IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE votes ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

-- Adjust vote_count on posts as votes are inserted/updated/deleted.
-- Uses counter-style increments (not SUM recalc) so seeded vote counts survive.
-- SECURITY DEFINER so the counter update succeeds regardless of the voter's
-- direct RLS access to the posts table.
CREATE OR REPLACE FUNCTION adjust_post_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET vote_count = vote_count + NEW.direction WHERE id = NEW.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts SET vote_count = vote_count + NEW.direction - OLD.direction WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET vote_count = vote_count - OLD.direction WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS vote_count_trigger ON votes;
CREATE TRIGGER vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION adjust_post_vote_count();

-- ----------------------------------------------------------------------------
-- COMMENTS (answers on Question Pulses, comments on Statement Pulses)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  text text NOT NULL,
  is_incognito boolean DEFAULT false,
  vote_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

CREATE INDEX IF NOT EXISTS comments_post_idx ON comments (post_id, vote_count DESC);

-- Maintain posts.comment_count
CREATE OR REPLACE FUNCTION adjust_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS comment_count_trigger ON comments;
CREATE TRIGGER comment_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION adjust_post_comment_count();

-- ----------------------------------------------------------------------------
-- COMMENT_VOTES (Question Pulse answer voting)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comment_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  direction int CHECK (direction IN (-1, 1)),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

ALTER TABLE comment_votes ALTER COLUMN created_at TYPE timestamptz USING created_at AT TIME ZONE 'UTC';

CREATE OR REPLACE FUNCTION adjust_comment_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments SET vote_count = vote_count + NEW.direction WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE comments SET vote_count = vote_count + NEW.direction - OLD.direction WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments SET vote_count = vote_count - OLD.direction WHERE id = OLD.comment_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS comment_vote_count_trigger ON comment_votes;
CREATE TRIGGER comment_vote_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON comment_votes
  FOR EACH ROW EXECUTE FUNCTION adjust_comment_vote_count();

-- ----------------------------------------------------------------------------
-- ATOMIC VOTE TOGGLE RPCs
-- Eliminates SELECT-then-write races by serializing concurrent calls via
-- FOR UPDATE row lock. Uses auth.uid() server-side so direction can't be
-- spoofed for another user.
-- Returns the resulting userVote (1, -1, or 0).
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.toggle_post_vote(p_post_id uuid, p_direction int)
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing int;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_direction NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'Invalid direction: %', p_direction;
  END IF;

  SELECT direction INTO v_existing
  FROM votes
  WHERE post_id = p_post_id AND user_id = v_uid
  FOR UPDATE;

  IF v_existing IS NULL THEN
    INSERT INTO votes (post_id, user_id, direction) VALUES (p_post_id, v_uid, p_direction);
    RETURN p_direction;
  ELSIF v_existing = p_direction THEN
    DELETE FROM votes WHERE post_id = p_post_id AND user_id = v_uid;
    RETURN 0;
  ELSE
    UPDATE votes SET direction = p_direction WHERE post_id = p_post_id AND user_id = v_uid;
    RETURN p_direction;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.toggle_comment_vote(p_comment_id uuid, p_direction int)
RETURNS int
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing int;
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_direction NOT IN (-1, 1) THEN
    RAISE EXCEPTION 'Invalid direction: %', p_direction;
  END IF;

  SELECT direction INTO v_existing
  FROM comment_votes
  WHERE comment_id = p_comment_id AND user_id = v_uid
  FOR UPDATE;

  IF v_existing IS NULL THEN
    INSERT INTO comment_votes (comment_id, user_id, direction) VALUES (p_comment_id, v_uid, p_direction);
    RETURN p_direction;
  ELSIF v_existing = p_direction THEN
    DELETE FROM comment_votes WHERE comment_id = p_comment_id AND user_id = v_uid;
    RETURN 0;
  ELSE
    UPDATE comment_votes SET direction = p_direction WHERE comment_id = p_comment_id AND user_id = v_uid;
    RETURN p_direction;
  END IF;
END;
$$;

-- ----------------------------------------------------------------------------
-- WATCHED — one row per (user, post). Carries the snapshot for delta display.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS watched (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  snapshot_votes int NOT NULL DEFAULT 0,
  snapshot_comment_count int NOT NULL DEFAULT 0,
  snapshot_top_comment_id uuid REFERENCES comments(id) ON DELETE SET NULL,
  snapshot_top_comment_votes int NOT NULL DEFAULT 0,
  taken_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE watched ALTER COLUMN taken_at TYPE timestamptz USING taken_at AT TIME ZONE 'UTC';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE watched ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON profiles;
CREATE POLICY "Profiles viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- ---- posts ----
DROP POLICY IF EXISTS "Posts viewable by everyone" ON posts;
CREATE POLICY "Posts viewable by everyone"
  ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Verified users can create posts" ON posts;
CREATE POLICY "Verified users can create posts"
  ON posts FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
  );

DROP POLICY IF EXISTS "Owners can update own posts" ON posts;
CREATE POLICY "Owners can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete own posts" ON posts;
CREATE POLICY "Owners can delete own posts"
  ON posts FOR DELETE USING (auth.uid() = user_id);

-- ---- votes (private to owner) ----
DROP POLICY IF EXISTS "Users can view own votes" ON votes;
CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own votes" ON votes;
CREATE POLICY "Users can insert own votes"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own votes" ON votes;
CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own votes" ON votes;
CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- ---- comments (public read, owner write) ----
DROP POLICY IF EXISTS "Comments viewable by everyone" ON comments;
CREATE POLICY "Comments viewable by everyone"
  ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Verified users can create comments" ON comments;
CREATE POLICY "Verified users can create comments"
  ON comments FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_verified = true)
  );

DROP POLICY IF EXISTS "Owners can update own comments" ON comments;
CREATE POLICY "Owners can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can delete own comments" ON comments;
CREATE POLICY "Owners can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- ---- comment_votes (private to owner) ----
DROP POLICY IF EXISTS "Users can view own comment votes" ON comment_votes;
CREATE POLICY "Users can view own comment votes"
  ON comment_votes FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own comment votes" ON comment_votes;
CREATE POLICY "Users can insert own comment votes"
  ON comment_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comment votes" ON comment_votes;
CREATE POLICY "Users can update own comment votes"
  ON comment_votes FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comment votes" ON comment_votes;
CREATE POLICY "Users can delete own comment votes"
  ON comment_votes FOR DELETE USING (auth.uid() = user_id);

-- ---- watched (private to owner) ----
DROP POLICY IF EXISTS "Users can view own watched" ON watched;
CREATE POLICY "Users can view own watched"
  ON watched FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own watched" ON watched;
CREATE POLICY "Users can insert own watched"
  ON watched FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own watched" ON watched;
CREATE POLICY "Users can update own watched"
  ON watched FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own watched" ON watched;
CREATE POLICY "Users can delete own watched"
  ON watched FOR DELETE USING (auth.uid() = user_id);
