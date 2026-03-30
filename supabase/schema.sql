-- =============================================
-- ENUMS
-- =============================================

-- User role enum
CREATE TYPE user_role AS ENUM ('admin', 'officer');

-- Contact status enum
CREATE TYPE contact_status AS ENUM ('new', 'in_progress', 'resolved', 'archived');

-- Upload status enum
CREATE TYPE upload_status AS ENUM ('draft', 'published', 'archived');

-- Sponsor tier enum
CREATE TYPE sponsor_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');

-- =============================================
-- PROFILES TABLE
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'officer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INVITES TABLE
-- =============================================

-- Invite status enum
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired');

CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role user_role DEFAULT 'officer',
  token TEXT UNIQUE NOT NULL,
  status invite_status DEFAULT 'pending',
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- CONTACT US TABLE
-- =============================================

CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status contact_status DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PAST PRESIDENTS TABLE
-- =============================================

CREATE TABLE past_presidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT,
  year TEXT NOT NULL,
  status upload_status DEFAULT 'published',
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_past_presidents_updated_at BEFORE UPDATE ON past_presidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PNW EVENT NOTIFICATIONS TABLE
-- (Tracks which events have already been notified to Discord)
-- =============================================

CREATE TABLE pnw_event_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_name TEXT,
  notified_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CATEGORIES TABLES
-- =============================================

CREATE TABLE project_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE article_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_project_categories_updated_at BEFORE UPDATE ON project_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_categories_updated_at BEFORE UPDATE ON article_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TEAMS TABLE (Flexible team management)
-- =============================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROJECTS TABLE
-- =============================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  hero_image_url TEXT,
  category_id UUID REFERENCES project_categories(id) ON DELETE SET NULL,
  status upload_status DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROJECT COMPONENTS TABLE
-- =============================================

CREATE TABLE project_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT, -- Tiptap JSON content
  image_url TEXT,
  image_title TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_project_components_updated_at BEFORE UPDATE ON project_components
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SUB-PROJECTS TABLE
-- =============================================

CREATE TABLE sub_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  content TEXT, -- Tiptap JSON content
  author_name TEXT NOT NULL DEFAULT 'Anonimous',
  status upload_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

CREATE TRIGGER update_sub_projects_updated_at BEFORE UPDATE ON sub_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- PROJECT TEAM TABLE
-- =============================================

CREATE TABLE project_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  title TEXT,
  image_url TEXT,
  date TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_project_team_updated_at BEFORE UPDATE ON project_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TECHNICAL ARTICLES TABLE
-- =============================================

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  content TEXT, -- Tiptap JSON content
  category_id UUID REFERENCES article_categories(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonimous',
  time_to_read INTEGER, -- in minutes
  status upload_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SPONSORS TABLE
-- =============================================

CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tier sponsor_tier NOT NULL,
  description TEXT,
  link TEXT
);

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON sponsors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TEAM MEMBER OVERRIDES TABLE
-- (Custom image, LinkedIn, email for web-scraped members)
-- =============================================

CREATE TABLE team_member_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT UNIQUE NOT NULL,
  custom_image_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_team_member_overrides_updated_at BEFORE UPDATE ON team_member_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_presidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================

-- Users can view all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert profiles (for inviting officers)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- CONTACT SUBMISSIONS POLICIES
-- =============================================

-- Anyone can insert contact submissions (public form)
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins/officers can view
CREATE POLICY "Admins and officers can view contact submissions"
  ON contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Only authenticated admins/officers can update
CREATE POLICY "Admins and officers can update contact submissions"
  ON contact_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Only admins can delete
CREATE POLICY "Admins can delete contact submissions"
  ON contact_submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- INVITES POLICIES
-- =============================================

-- Anyone can view an invite by token (for signup flow)
CREATE POLICY "Anyone can view invite by token"
  ON invites FOR SELECT
  USING (true);

-- Admins can create invites
CREATE POLICY "Admins can create invites"
  ON invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update invites
CREATE POLICY "Admins can update invites"
  ON invites FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete invites
CREATE POLICY "Admins can delete invites"
  ON invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- PAST PRESIDENTS POLICIES
-- =============================================

-- Everyone can view published past presidents
CREATE POLICY "Everyone can view published past presidents"
  ON past_presidents FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  ));

-- Admins and officers can manage
CREATE POLICY "Admins and officers can manage past presidents"
  ON past_presidents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- CATEGORIES POLICIES
-- =============================================

-- Everyone can view categories
CREATE POLICY "Everyone can view project categories"
  ON project_categories FOR SELECT
  USING (true);

CREATE POLICY "Everyone can view article categories"
  ON article_categories FOR SELECT
  USING (true);

-- Admins and officers can manage categories
CREATE POLICY "Admins and officers can manage project categories"
  ON project_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and officers can manage article categories"
  ON article_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- TEAMS POLICIES
-- =============================================

-- Everyone can view teams
CREATE POLICY "Everyone can view teams"
  ON teams FOR SELECT
  USING (true);

-- Admins and officers can manage teams
CREATE POLICY "Admins and officers can manage teams"
  ON teams FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- PROJECTS POLICIES
-- =============================================

-- Everyone can view published projects
CREATE POLICY "Everyone can view published projects"
  ON projects FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  ));

-- Admins and officers can manage projects
CREATE POLICY "Admins and officers can insert projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and officers can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and officers can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- PROJECT COMPONENTS POLICIES
-- =============================================

-- Everyone can view components of published projects
CREATE POLICY "Everyone can view published project components"
  ON project_components FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_components.project_id 
      AND status = 'published'
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins and officers can manage components
CREATE POLICY "Admins and officers can manage project components"
  ON project_components FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- SUB-PROJECTS POLICIES
-- =============================================

-- Everyone can view published sub-projects
CREATE POLICY "Everyone can view published sub-projects"
  ON sub_projects FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  ));

-- Admins and officers can manage sub-projects
CREATE POLICY "Admins and officers can manage sub-projects"
  ON sub_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- PROJECT TEAM POLICIES
-- =============================================

-- Everyone can view project team members
CREATE POLICY "Everyone can view project team"
  ON project_team FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE id = project_team.project_id 
      AND status = 'published'
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- Admins and officers can manage team members
CREATE POLICY "Admins and officers can manage project team"
  ON project_team FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- ARTICLES POLICIES
-- =============================================

-- Everyone can view published articles
CREATE POLICY "Everyone can view published articles"
  ON articles FOR SELECT
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid()
  ));

-- Admins and officers can manage articles
CREATE POLICY "Admins and officers can manage articles"
  ON articles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- SPONSORS POLICIES
-- =============================================

-- Everyone can view sponsors
CREATE POLICY "Everyone can view sponsors"
  ON sponsors FOR SELECT
  USING (true);

-- Admins and officers can manage sponsors
CREATE POLICY "Admins and officers can manage sponsors"
  ON sponsors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- TEAM MEMBER OVERRIDES POLICIES
-- =============================================

-- Everyone can view team member overrides (public team page)
CREATE POLICY "Everyone can view team member overrides"
  ON team_member_overrides FOR SELECT
  USING (true);

-- Admins and officers can manage team member overrides
CREATE POLICY "Admins and officers can manage team member overrides"
  ON team_member_overrides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()
    )
  );

-- =============================================
-- AUDIT LOGS POLICIES
-- =============================================

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert audit logs (handled by triggers)
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

CREATE INDEX idx_past_presidents_status ON past_presidents(status);
CREATE INDEX idx_past_presidents_order ON past_presidents(order_index);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_created_by ON projects(created_by);

CREATE INDEX idx_project_components_project ON project_components(project_id);
CREATE INDEX idx_project_components_order ON project_components(project_id, order_index);

CREATE INDEX idx_sub_projects_project ON sub_projects(project_id);
CREATE INDEX idx_sub_projects_status ON sub_projects(status);
CREATE INDEX idx_sub_projects_author ON sub_projects(author_name);

CREATE INDEX idx_project_team_project ON project_team(project_id);
CREATE INDEX idx_project_team_team ON project_team(team_id);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_name);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

CREATE INDEX idx_sponsors_tier ON sponsors(tier);
CREATE INDEX idx_sponsors_order ON sponsors(order_index);

CREATE INDEX idx_team_member_overrides_name ON team_member_overrides(member_name);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
