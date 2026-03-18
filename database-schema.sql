-- Achwanya 3D Tours Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table extending auth.users
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  company_name TEXT,
  plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  max_tours INTEGER DEFAULT 1,
  max_bedrooms INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  price DECIMAL(12,2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqft INTEGER,
  property_type TEXT DEFAULT 'apartment' CHECK (property_type IN ('apartment', 'house', 'villa', 'land')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tours table
CREATE TABLE tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  realsee_url TEXT NOT NULL,
  realsee_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'processing')),
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  avg_view_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  source TEXT DEFAULT 'tour' CHECK (source IN ('tour', 'website', 'whatsapp', 'referral')),
  quality_score INTEGER DEFAULT 1 CHECK (quality_score BETWEEN 1 AND 5),
  contacted BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tour analytics table
CREATE TABLE tour_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  view_duration_seconds INTEGER,
  completed_tour BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'KES',
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND email = 'admin@achwanya.co.ke'
  )
);

-- Properties RLS
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Admin can manage all properties" ON properties FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND email = 'admin@achwanya.co.ke'
  )
);

-- Tours RLS
CREATE POLICY "Users can view own tours" ON tours FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can view public tour analytics" ON tours FOR SELECT USING (status = 'active');
CREATE POLICY "Admin can manage all tours" ON tours FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND email = 'admin@achwanya.co.ke'
  )
);

-- Leads RLS
CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can insert leads" ON leads FOR INSERT WITH CHECK (tour_id IN (
  SELECT id FROM tours WHERE status = 'active'
));
CREATE POLICY "Admin can view all leads" ON leads FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND email = 'admin@achwanya.co.ke'
  )
);

-- Tour Analytics RLS
CREATE POLICY "Users can view own tour analytics" ON tour_analytics FOR SELECT USING (
  tour_id IN (SELECT id FROM tours WHERE profile_id = auth.uid())
);
CREATE POLICY "Public can insert analytics" ON tour_analytics FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_tours_profile_id ON tours(profile_id);
CREATE INDEX idx_tours_property_id ON tours(property_id);
CREATE INDEX idx_leads_tour_id ON leads(tour_id);
CREATE INDEX idx_leads_profile_id ON leads(profile_id);
CREATE INDEX idx_tour_analytics_tour_id ON tour_analytics(tour_id);
CREATE INDEX idx_properties_profile_id ON properties(profile_id);

-- Functions for subscription management
CREATE OR REPLACE FUNCTION check_subscription_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  max_tours INTEGER;
  current_tours INTEGER;
BEGIN
  -- Get user's plan and current tour count
  SELECT plan_type, max_tours INTO user_plan, max_tours
  FROM profiles WHERE id = NEW.profile_id;
  
  -- Count current active tours
  SELECT COUNT(*) INTO current_tours
  FROM tours WHERE profile_id = NEW.profile_id AND status = 'active';
  
  -- Check if user is within limits
  IF current_tours >= max_tours THEN
    RAISE EXCEPTION 'Tour limit reached for % plan. Maximum: %', user_plan, max_tours;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tour limits
CREATE TRIGGER enforce_tour_limits
BEFORE INSERT ON tours
FOR EACH ROW EXECUTE FUNCTION check_subscription_limits();

-- Function to update tour analytics
CREATE OR REPLACE FUNCTION update_tour_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tours SET
    views = views + 1,
    updated_at = NOW()
  WHERE id = NEW.tour_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tour analytics
CREATE TRIGGER update_tour_analytics
AFTER INSERT ON tour_analytics
FOR EACH ROW EXECUTE FUNCTION update_tour_stats();
