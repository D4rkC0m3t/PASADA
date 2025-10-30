-- =================================================================
-- RLS POLICIES - BASED ON ACTUAL SCHEMA
-- =================================================================
--
-- Schema discovered:
-- - clients table has: created_by, updated_by (NOT user_id)
-- - This is admin-managed, not user-owned
-- =================================================================

-- =================================================================
-- CLIENTS POLICIES (Admin-Managed)
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Admins can view all clients" ON clients;
    DROP POLICY IF EXISTS "Admins can create clients" ON clients;
    DROP POLICY IF EXISTS "Admins can update clients" ON clients;
    DROP POLICY IF EXISTS "Admins can delete clients" ON clients;
    DROP POLICY IF EXISTS "Service role full access" ON clients;

    -- Admins and staff can view all clients
    CREATE POLICY "Admins can view all clients"
      ON clients FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Admins and staff can create clients
    CREATE POLICY "Admins can create clients"
      ON clients FOR INSERT
      WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Admins and staff can update clients
    CREATE POLICY "Admins can update clients"
      ON clients FOR UPDATE
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Only admins can delete clients
    CREATE POLICY "Admins can delete clients"
      ON clients FOR DELETE
      USING (
        auth.jwt() ->> 'role' = 'admin'
      );

    -- Service role has full access (for backend operations)
    CREATE POLICY "Service role full access"
      ON clients FOR ALL
      USING (auth.role() = 'service_role');
    
    RAISE NOTICE '✅ Created clients policies (admin-managed)';
  ELSE
    RAISE NOTICE '⚠️  Clients table does not exist';
  END IF;
END $$;

-- =================================================================
-- PROJECTS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
    DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
    DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
    DROP POLICY IF EXISTS "Service role full access" ON projects;

    -- Admins can view all projects
    CREATE POLICY "Admins can view all projects"
      ON projects FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Admins can manage all projects
    CREATE POLICY "Admins can manage projects"
      ON projects FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Service role full access
    CREATE POLICY "Service role full access"
      ON projects FOR ALL
      USING (auth.role() = 'service_role');
    
    RAISE NOTICE '✅ Created projects policies';
  ELSE
    RAISE NOTICE '⚠️  Projects table does not exist';
  END IF;
END $$;

-- =================================================================
-- MATERIALS POLICIES (Public Catalog)
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'materials') THEN
    DROP POLICY IF EXISTS "Anyone can view materials" ON materials;
    DROP POLICY IF EXISTS "Admins can manage materials" ON materials;

    -- Anyone authenticated can view materials
    CREATE POLICY "Anyone can view materials"
      ON materials FOR SELECT
      USING (auth.role() = 'authenticated');

    -- Only admins can manage materials
    CREATE POLICY "Admins can manage materials"
      ON materials FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );
    
    RAISE NOTICE '✅ Created materials policies';
  END IF;
END $$;

-- =================================================================
-- QUOTATIONS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotations') THEN
    DROP POLICY IF EXISTS "Admins can view all quotations" ON quotations;
    DROP POLICY IF EXISTS "Admins can manage quotations" ON quotations;

    -- Admins can view all quotations
    CREATE POLICY "Admins can view all quotations"
      ON quotations FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Admins can manage quotations
    CREATE POLICY "Admins can manage quotations"
      ON quotations FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );
    
    RAISE NOTICE '✅ Created quotations policies';
  END IF;
END $$;

-- =================================================================
-- QUOTATION ITEMS POLICIES
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotation_items') THEN
    DROP POLICY IF EXISTS "Admins can manage quotation items" ON quotation_items;

    -- Admins can manage all quotation items
    CREATE POLICY "Admins can manage quotation items"
      ON quotation_items FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );
    
    RAISE NOTICE '✅ Created quotation_items policies';
  END IF;
END $$;

-- =================================================================
-- BOOKINGS POLICIES (Public can create, admins manage)
-- =================================================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bookings') THEN
    DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
    DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
    DROP POLICY IF EXISTS "Admins can manage bookings" ON bookings;

    -- Anyone can create a booking (contact form)
    CREATE POLICY "Anyone can create bookings"
      ON bookings FOR INSERT
      WITH CHECK (true);

    -- Admins can view all bookings
    CREATE POLICY "Admins can view all bookings"
      ON bookings FOR SELECT
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );

    -- Admins can manage bookings
    CREATE POLICY "Admins can manage bookings"
      ON bookings FOR ALL
      USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'role' = 'staff'
      );
    
    RAISE NOTICE '✅ Created bookings policies';
  END IF;
END $$;

-- =================================================================
-- COMPLETION MESSAGE
-- =================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created successfully!';
  RAISE NOTICE '📊 Policy Summary:';
  RAISE NOTICE '   - Admins/Staff: Full access to all data';
  RAISE NOTICE '   - Authenticated: Can view materials catalog';
  RAISE NOTICE '   - Public: Can create bookings';
  RAISE NOTICE '   - Service Role: Full backend access';
END $$;
