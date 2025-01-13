/*
  # Initial Schema Setup for UK Postcode Lookup

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `api_key` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `api_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `endpoint` (text)
      - `timestamp` (timestamp)
      - `status` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL,
  full_name text,
  api_key text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create api_usage table
CREATE TABLE api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  endpoint text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- API usage policies
CREATE POLICY "Users can view own API usage"
  ON api_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert API usage"
  ON api_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);