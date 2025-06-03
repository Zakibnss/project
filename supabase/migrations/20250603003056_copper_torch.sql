/*
  # Initial Schema Setup

  1. New Tables
    - associations
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
      - user_id (uuid, references auth.users)

    - members
      - id (uuid, primary key)
      - first_name (text)
      - last_name (text)
      - date_of_birth (date)
      - type (text) - can be 'adherent', 'coach', or 'referee'
      - grade (text, nullable) - for coaches and referees
      - association_id (uuid, references associations)
      - created_at (timestamp)

    - competitions
      - id (uuid, primary key)
      - name (text)
      - date (date)
      - location (text)
      - registration_deadline (date)
      - created_at (timestamp)

    - competition_registrations
      - id (uuid, primary key)
      - competition_id (uuid, references competitions)
      - member_id (uuid, references members)
      - weight (numeric)
      - created_at (timestamp)

    - competition_results
      - id (uuid, primary key)
      - competition_id (uuid, references competitions)
      - poule_name (text)
      - first_place_member_id (uuid, references members)
      - second_place_member_id (uuid, references members)
      - third_place_member_id (uuid, references members)
      - fourth_place_member_id (uuid, references members)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create associations table
CREATE TABLE associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own association"
  ON associations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all associations"
  ON associations
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create members table
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  type text NOT NULL CHECK (type IN ('adherent', 'coach', 'referee')),
  grade text,
  association_id uuid REFERENCES associations NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their association's members"
  ON members
  FOR SELECT
  TO authenticated
  USING (
    association_id IN (
      SELECT id FROM associations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their association's members"
  ON members
  FOR ALL
  TO authenticated
  USING (
    association_id IN (
      SELECT id FROM associations WHERE user_id = auth.uid()
    )
  );

-- Create competitions table
CREATE TABLE competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  registration_deadline date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can manage competitions"
  ON competitions
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create competition_registrations table
CREATE TABLE competition_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions NOT NULL,
  member_id uuid REFERENCES members NOT NULL,
  weight numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competition_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their registrations"
  ON competition_registrations
  FOR SELECT
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM members WHERE association_id IN (
        SELECT id FROM associations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage their registrations"
  ON competition_registrations
  FOR ALL
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM members WHERE association_id IN (
        SELECT id FROM associations WHERE user_id = auth.uid()
      )
    )
  );

-- Create competition_results table
CREATE TABLE competition_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id uuid REFERENCES competitions NOT NULL,
  poule_name text NOT NULL,
  first_place_member_id uuid REFERENCES members,
  second_place_member_id uuid REFERENCES members,
  third_place_member_id uuid REFERENCES members,
  fourth_place_member_id uuid REFERENCES members,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE competition_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view results"
  ON competition_results
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can manage results"
  ON competition_results
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');