CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  household_size INT,
  monthly_income NUMERIC,
  housing_type TEXT,
  housing_payment NUMERIC,
  debt TEXT,
  savings NUMERIC,
  goal TEXT,
  created_at TIMESTAMP DEFAULT now()
);
