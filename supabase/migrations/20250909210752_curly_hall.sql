/*
  # Create complaints management system

  1. New Tables
    - `complaints`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `client_id` (uuid, foreign key to client table)
      - `fournisseur_id` (uuid, foreign key to fournisseurs table, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `complaints` table
    - Add policies for clients to manage their own complaints
    - Add policies for fournisseurs to view assigned complaints
    - Add policies for admins to manage all complaints

  3. Changes
    - Create complaints table with proper relationships
    - Set up row level security policies
    - Add indexes for performance
*/

CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  client_id uuid NOT NULL REFERENCES client(id) ON DELETE CASCADE,
  fournisseur_id uuid REFERENCES fournisseurs(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Policies for clients
CREATE POLICY "Clients can view their own complaints"
  ON complaints
  FOR SELECT
  TO public
  USING (client_id IN (SELECT id FROM client WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Clients can insert their own complaints"
  ON complaints
  FOR INSERT
  TO public
  WITH CHECK (client_id IN (SELECT id FROM client WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Clients can update their own complaints"
  ON complaints
  FOR UPDATE
  TO public
  USING (client_id IN (SELECT id FROM client WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Clients can delete their own complaints"
  ON complaints
  FOR DELETE
  TO public
  USING (client_id IN (SELECT id FROM client WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Policies for fournisseurs
CREATE POLICY "Fournisseurs can view assigned complaints"
  ON complaints
  FOR SELECT
  TO public
  USING (fournisseur_id IN (SELECT id FROM fournisseurs WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Fournisseurs can update assigned complaints status"
  ON complaints
  FOR UPDATE
  TO public
  USING (fournisseur_id IN (SELECT id FROM fournisseurs WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Policies for admins (full access)
CREATE POLICY "Admins can view all complaints"
  ON complaints
  FOR SELECT
  TO public
  USING (EXISTS (SELECT 1 FROM admin WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can insert complaints"
  ON complaints
  FOR INSERT
  TO public
  WITH CHECK (EXISTS (SELECT 1 FROM admin WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can update all complaints"
  ON complaints
  FOR UPDATE
  TO public
  USING (EXISTS (SELECT 1 FROM admin WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Admins can delete all complaints"
  ON complaints
  FOR DELETE
  TO public
  USING (EXISTS (SELECT 1 FROM admin WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_complaints_client_id ON complaints(client_id);
CREATE INDEX IF NOT EXISTS idx_complaints_fournisseur_id ON complaints(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();