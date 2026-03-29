ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE TABLE IF NOT EXISTS financial_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  package JSONB,
  created_at TIMESTAMP DEFAULT now()
);
