-- Drop all existing policies on users table to avoid recursion
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Superadmin can read all users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;

-- Create simple policies without recursion
CREATE POLICY "Users can read all user data"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Fix forms policies
DROP POLICY IF EXISTS "Users can read their own forms" ON public.forms;
DROP POLICY IF EXISTS "Superadmin can read all forms" ON public.forms;

CREATE POLICY "Users can read own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Superadmins can read all forms"
  ON public.forms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() 
      AND users.role = 'superadmin'
    )
  );
