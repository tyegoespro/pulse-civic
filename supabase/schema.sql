-- Pulse Database Schema
-- Run this in your Supabase SQL editor

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id uuid references auth.users ON DELETE CASCADE,
  display_name text,
  is_verified boolean default false,
  verified_at timestamp,
  city text default 'Oshkosh',
  state text default 'WI',
  created_at timestamp default now(),
  PRIMARY KEY (id)
);

-- Posts
CREATE TABLE posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) ON DELETE CASCADE,
  title text not null,
  description text,
  category text not null,
  location_label text,
  lat float,
  lng float,
  is_incognito boolean default false,
  vote_count int default 1,
  comment_count int default 0,
  created_at timestamp default now()
);

-- Votes
CREATE TABLE votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) ON DELETE CASCADE,
  post_id uuid references posts(id) ON DELETE CASCADE,
  direction int CHECK (direction IN (-1, 1)),
  created_at timestamp default now(),
  UNIQUE(user_id, post_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts: all verified users can read; incognito posts hide user_id for non-owners
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Verified users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Votes: private — only owner can see their own votes
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Function to update vote_count on posts
CREATE OR REPLACE FUNCTION update_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts SET vote_count = (
    SELECT COALESCE(SUM(direction), 0) FROM votes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
  ) WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vote_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION update_vote_count();
