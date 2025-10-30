-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Complete security policies for all tables
-- =================================================================
--
-- IDEMPOTENT: Safe to run multiple times
-- Policies will only be created for tables that exist
-- Tables that don't exist will be skipped with notices
--
-- USAGE: Copy entire file and run in Supabase SQL Editor
-- =================================================================

-- =================================================================
-- ENABLE RLS ON ALL TABLES (only if they exist)
-- =================================================================

DO $$ 
BEGIN
  -- Enable RLS on clients table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on clients table';
  ELSE
    RAISE NOTICE 'Clients table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on projects table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on projects table';
  ELSE
    RAISE NOTICE 'Projects table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on materials table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on materials table';
  ELSE
    RAISE NOTICE 'Materials table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on quotations table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on quotations table';
  ELSE
    RAISE NOTICE 'Quotations table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on quotation_items table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotation_items') THEN
    ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on quotation_items table';
  ELSE
    RAISE NOTICE 'Quotation_items table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on bookings table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on bookings table';
  ELSE
    RAISE NOTICE 'Bookings table does not exist - skipping RLS';
  END IF;

  -- Enable RLS on user_profiles table if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on user_profiles table';
  ELSE
    RAISE NOTICE 'User_profiles table does not exist - skipping RLS';
  END IF;
END $$;

-- =================================================================
-- USER PROFILES POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
    DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;

    CREATE POLICY "Users can view own profile"
      ON user_profiles FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can update own profile"
      ON user_profiles FOR UPDATE
      USING (auth.uid() = id);

    CREATE POLICY "Admins can view all profiles"
      ON user_profiles FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can update user roles"
      ON user_profiles FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    
    RAISE NOTICE 'Created user_profiles policies';
  ELSE
    RAISE NOTICE 'User_profiles table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- CLIENTS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
    DROP POLICY IF EXISTS "Clients can view own record" ON clients;
    DROP POLICY IF EXISTS "Admins can create clients" ON clients;
    DROP POLICY IF EXISTS "Admins can update clients" ON clients;
    DROP POLICY IF EXISTS "Admins can archive clients" ON clients;

    CREATE POLICY "Admins can view all clients"
      ON clients FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can view own record"
      ON clients FOR SELECT
      USING (
        auth.uid()::text = user_id::text
      );

    CREATE POLICY "Admins can create clients"
      ON clients FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can update clients"
      ON clients FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can archive clients"
      ON clients FOR DELETE
      USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    
    RAISE NOTICE 'Created clients policies';
  ELSE
    RAISE NOTICE 'Clients table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- PROJECTS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
    DROP POLICY IF EXISTS "Clients can view own projects" ON projects;
    DROP POLICY IF EXISTS "Admins can create projects" ON projects;
    DROP POLICY IF EXISTS "Admins can update projects" ON projects;
    DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

    CREATE POLICY "Admins can view all projects"
      ON projects FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can view own projects"
      ON projects FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = projects.client_id
          AND clients.user_id = auth.uid()
        )
      );

    CREATE POLICY "Admins can create projects"
      ON projects FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can update projects"
      ON projects FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can delete projects"
      ON projects FOR DELETE
      USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    
    RAISE NOTICE 'Created projects policies';
  ELSE
    RAISE NOTICE 'Projects table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- MATERIALS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    DROP POLICY IF EXISTS "Anyone can view materials" ON materials;
    DROP POLICY IF EXISTS "Admins can create materials" ON materials;
    DROP POLICY IF EXISTS "Admins can update materials" ON materials;
    DROP POLICY IF EXISTS "Admins can delete materials" ON materials;

    CREATE POLICY "Anyone can view materials"
      ON materials FOR SELECT
      USING (auth.role() = 'authenticated');

    CREATE POLICY "Admins can create materials"
      ON materials FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can update materials"
      ON materials FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can delete materials"
      ON materials FOR DELETE
      USING (
        auth.jwt() ->> 'role' = 'admin'
      );
    
    RAISE NOTICE 'Created materials policies';
  ELSE
    RAISE NOTICE 'Materials table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- QUOTATIONS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    DROP POLICY IF EXISTS "Admins can view all quotations" ON quotations;
    DROP POLICY IF EXISTS "Clients can view own quotations" ON quotations;
    DROP POLICY IF EXISTS "Admins can create quotations" ON quotations;
    DROP POLICY IF EXISTS "Admins can update quotations" ON quotations;
    DROP POLICY IF EXISTS "Clients can update quotation status" ON quotations;

    CREATE POLICY "Admins can view all quotations"
      ON quotations FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can view own quotations"
      ON quotations FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = quotations.client_id
          AND clients.user_id = auth.uid()
        )
      );

    CREATE POLICY "Admins can create quotations"
      ON quotations FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Admins can update quotations"
      ON quotations FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can update quotation status"
      ON quotations FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = quotations.client_id
          AND clients.user_id = auth.uid()
        )
      )
      WITH CHECK (
        OLD.id = NEW.id AND
        OLD.client_id = NEW.client_id AND
        OLD.project_id = NEW.project_id AND
        OLD.total_amount = NEW.total_amount AND
        OLD.created_at = NEW.created_at
      );
    
    RAISE NOTICE 'Created quotations policies';
  ELSE
    RAISE NOTICE 'Quotations table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- QUOTATION ITEMS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotation_items') THEN
    DROP POLICY IF EXISTS "Admins can view quotation items" ON quotation_items;
    DROP POLICY IF EXISTS "Clients can view own quotation items" ON quotation_items;
    DROP POLICY IF EXISTS "Admins can manage quotation items" ON quotation_items;

    CREATE POLICY "Admins can view quotation items"
      ON quotation_items FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can view own quotation items"
      ON quotation_items FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM quotations q
          JOIN clients c ON c.id = q.client_id
          WHERE q.id = quotation_items.quotation_id
          AND c.user_id = auth.uid()
        )
      );

    CREATE POLICY "Admins can manage quotation items"
      ON quotation_items FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );
    
    RAISE NOTICE 'Created quotation_items policies';
  ELSE
    RAISE NOTICE 'Quotation_items table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- BOOKINGS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
    DROP POLICY IF EXISTS "Clients can view own bookings" ON bookings;
    DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
    DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
    DROP POLICY IF EXISTS "Clients can cancel own bookings" ON bookings;

    CREATE POLICY "Admins can view all bookings"
      ON bookings FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can view own bookings"
      ON bookings FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = bookings.client_id
          AND clients.user_id = auth.uid()
        )
      );

    CREATE POLICY "Anyone can create bookings"
      ON bookings FOR INSERT
      WITH CHECK (true);

    CREATE POLICY "Admins can update bookings"
      ON bookings FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    CREATE POLICY "Clients can cancel own bookings"
      ON bookings FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM clients
          WHERE clients.id = bookings.client_id
          AND clients.user_id = auth.uid()
        )
      )
      WITH CHECK (
        OLD.status != 'cancelled' AND
        NEW.status = 'cancelled'
      );
    
    RAISE NOTICE 'Created bookings policies';
  ELSE
    RAISE NOTICE 'Bookings table does not exist - skipping policies';
  END IF;
END $$;

-- =================================================================
-- HELPER FUNCTIONS
-- =================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_access_project(project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF is_admin() THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = project_id
    AND c.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- STORAGE BUCKET POLICIES (for file uploads)
-- =================================================================

-- Create storage buckets (run these in Supabase Dashboard → Storage)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('material-images', 'material-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client-uploads', 'client-uploads', false);

DO $$
BEGIN
  -- Drop existing storage policies if they exist
  DROP POLICY IF EXISTS "Admins can upload project files" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can view project files" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view material images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins can upload material images" ON storage.objects;
  DROP POLICY IF EXISTS "Clients can upload own files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view own uploads" ON storage.objects;

  -- Project files policy
  CREATE POLICY "Admins can upload project files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'project-files' AND
      (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
    );

  CREATE POLICY "Admins can view project files"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'project-files' AND
      (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
    );

  -- Material images (public)
  CREATE POLICY "Anyone can view material images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'material-images');

  CREATE POLICY "Admins can upload material images"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'material-images' AND
      (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
    );

  -- Client uploads
  CREATE POLICY "Clients can upload own files"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'client-uploads' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

  CREATE POLICY "Users can view own uploads"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'client-uploads' AND
      (
        (storage.foldername(name))[1] = auth.uid()::text OR
        (auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff')
      )
    );
  
  RAISE NOTICE 'Created storage policies';
END $$;

-- =================================================================
-- TESTING RLS POLICIES
-- =================================================================

-- Test as admin:
-- SELECT auth.jwt() ->> 'role';
-- SELECT * FROM clients;

-- Test as client:
-- SELECT * FROM projects WHERE client_id IN (
--   SELECT id FROM clients WHERE user_id = auth.uid()
-- );

-- =================================================================
-- END OF RLS POLICIES
-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policy migration complete!';
END $$;
