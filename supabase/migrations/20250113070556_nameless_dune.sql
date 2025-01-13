/*
  # Fix profiles table policies

  1. Changes
    - Add INSERT policy for profiles table
    - Update SELECT policy to handle new users
    - Add default values for new columns
  
  2. Security
    - Maintain RLS while allowing profile creation
    - Ensure users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Add default values for required columns
ALTER TABLE profiles
ALTER COLUMN email SET DEFAULT current_user,
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Create new policies
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);