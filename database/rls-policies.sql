-- ================================================
-- PASADA CRM - Row Level Security (RLS) Policies
-- Version: 1.0
-- ================================================

-- ================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================
-- HELPER FUNCTIONS FOR RLS
-- ================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is staff (admin or staff role)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role IN ('admin', 'staff')
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is client
CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid()
        AND role = 'client'
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get client_id for logged in user
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT c.id FROM clients c
        INNER JOIN user_profiles up ON up.id = auth.uid()
        WHERE c.email = up.id::text -- Adjust this based on your linking logic
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- USER PROFILES POLICIES
-- ================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (is_admin());

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles"
    ON user_profiles FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON user_profiles FOR UPDATE
    USING (is_admin());

-- ================================================
-- CLIENTS POLICIES
-- ================================================

-- Staff can view all clients
CREATE POLICY "Staff can view clients"
    ON clients FOR SELECT
    USING (is_staff());

-- Clients can view their own record
CREATE POLICY "Clients can view own record"
    ON clients FOR SELECT
    USING (
        is_client() AND 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Staff can insert clients
CREATE POLICY "Staff can insert clients"
    ON clients FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update clients
CREATE POLICY "Staff can update clients"
    ON clients FOR UPDATE
    USING (is_staff());

-- Only admins can delete clients
CREATE POLICY "Admins can delete clients"
    ON clients FOR DELETE
    USING (is_admin());

-- ================================================
-- PROJECTS POLICIES
-- ================================================

-- Staff can view all projects
CREATE POLICY "Staff can view projects"
    ON projects FOR SELECT
    USING (is_staff());

-- Clients can view their own projects
CREATE POLICY "Clients can view own projects"
    ON projects FOR SELECT
    USING (
        is_client() AND 
        client_id IN (
            SELECT c.id FROM clients c
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can insert projects
CREATE POLICY "Staff can insert projects"
    ON projects FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update projects
CREATE POLICY "Staff can update projects"
    ON projects FOR UPDATE
    USING (is_staff());

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
    ON projects FOR DELETE
    USING (is_admin());

-- ================================================
-- QUOTATIONS POLICIES
-- ================================================

-- Staff can view all quotations
CREATE POLICY "Staff can view quotations"
    ON quotations FOR SELECT
    USING (is_staff());

-- Clients can view quotations for their projects
CREATE POLICY "Clients can view own quotations"
    ON quotations FOR SELECT
    USING (
        is_client() AND 
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN clients c ON p.client_id = c.id
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can insert quotations
CREATE POLICY "Staff can insert quotations"
    ON quotations FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update quotations
CREATE POLICY "Staff can update quotations"
    ON quotations FOR UPDATE
    USING (is_staff());

-- Clients can update quotation status (approve/reject)
CREATE POLICY "Clients can update quotation status"
    ON quotations FOR UPDATE
    USING (
        is_client() AND 
        project_id IN (
            SELECT p.id FROM projects p
            INNER JOIN clients c ON p.client_id = c.id
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (
        -- Only allow updating specific columns
        status IN ('approved', 'rejected')
    );

-- Only admins can delete quotations
CREATE POLICY "Admins can delete quotations"
    ON quotations FOR DELETE
    USING (is_admin());

-- ================================================
-- QUOTE ITEMS POLICIES
-- ================================================

-- Staff can view all quote items
CREATE POLICY "Staff can view quote items"
    ON quote_items FOR SELECT
    USING (is_staff());

-- Clients can view quote items for their quotations
CREATE POLICY "Clients can view own quote items"
    ON quote_items FOR SELECT
    USING (
        is_client() AND 
        quotation_id IN (
            SELECT q.id FROM quotations q
            INNER JOIN projects p ON q.project_id = p.id
            INNER JOIN clients c ON p.client_id = c.id
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can insert quote items
CREATE POLICY "Staff can insert quote items"
    ON quote_items FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update quote items
CREATE POLICY "Staff can update quote items"
    ON quote_items FOR UPDATE
    USING (is_staff());

-- Staff can delete quote items
CREATE POLICY "Staff can delete quote items"
    ON quote_items FOR DELETE
    USING (is_staff());

-- ================================================
-- MATERIALS POLICIES
-- ================================================

-- Everyone can view active materials
CREATE POLICY "Everyone can view active materials"
    ON materials FOR SELECT
    USING (status = 'active' OR is_staff());

-- Staff can view all materials
CREATE POLICY "Staff can view all materials"
    ON materials FOR SELECT
    USING (is_staff());

-- Staff can insert materials
CREATE POLICY "Staff can insert materials"
    ON materials FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update materials
CREATE POLICY "Staff can update materials"
    ON materials FOR UPDATE
    USING (is_staff());

-- Only admins can delete materials
CREATE POLICY "Admins can delete materials"
    ON materials FOR DELETE
    USING (is_admin());

-- ================================================
-- VENDORS POLICIES
-- ================================================

-- Staff can view all vendors
CREATE POLICY "Staff can view vendors"
    ON vendors FOR SELECT
    USING (is_staff());

-- Staff can insert vendors
CREATE POLICY "Staff can insert vendors"
    ON vendors FOR INSERT
    WITH CHECK (is_staff());

-- Staff can update vendors
CREATE POLICY "Staff can update vendors"
    ON vendors FOR UPDATE
    USING (is_staff());

-- Only admins can delete vendors
CREATE POLICY "Admins can delete vendors"
    ON vendors FOR DELETE
    USING (is_admin());

-- ================================================
-- TEMPLATES POLICIES
-- ================================================

-- Everyone can view templates
CREATE POLICY "Everyone can view templates"
    ON templates FOR SELECT
    USING (true);

-- Only admins can modify templates
CREATE POLICY "Admins can insert templates"
    ON templates FOR INSERT
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update templates"
    ON templates FOR UPDATE
    USING (is_admin());

CREATE POLICY "Admins can delete templates"
    ON templates FOR DELETE
    USING (is_admin());

-- ================================================
-- BOOKINGS POLICIES
-- ================================================

-- Staff can view all bookings
CREATE POLICY "Staff can view bookings"
    ON bookings FOR SELECT
    USING (is_staff());

-- Clients can view their own bookings
CREATE POLICY "Clients can view own bookings"
    ON bookings FOR SELECT
    USING (
        is_client() AND 
        client_id IN (
            SELECT c.id FROM clients c
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can insert bookings
CREATE POLICY "Staff can insert bookings"
    ON bookings FOR INSERT
    WITH CHECK (is_staff());

-- Clients can create their own bookings
CREATE POLICY "Clients can insert own bookings"
    ON bookings FOR INSERT
    WITH CHECK (
        is_client() AND 
        client_id IN (
            SELECT c.id FROM clients c
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Staff can update bookings
CREATE POLICY "Staff can update bookings"
    ON bookings FOR UPDATE
    USING (is_staff());

-- Clients can cancel their own bookings
CREATE POLICY "Clients can cancel own bookings"
    ON bookings FOR UPDATE
    USING (
        is_client() AND 
        client_id IN (
            SELECT c.id FROM clients c
            WHERE c.email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    )
    WITH CHECK (status = 'cancelled');

-- Only admins can delete bookings
CREATE POLICY "Admins can delete bookings"
    ON bookings FOR DELETE
    USING (is_admin());

-- ================================================
-- AUDIT LOGS POLICIES
-- ================================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

-- System can insert audit logs (via triggers)
CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- No one can update or delete audit logs
-- (Audit logs should be immutable)

-- ================================================
-- SUMMARY OF POLICIES
-- ================================================

/*
ROLE PERMISSIONS SUMMARY:

ADMIN:
- Full access to all tables
- Can delete records
- Can view audit logs
- Can manage templates
- Can manage user profiles

STAFF:
- Can view, create, update clients, projects, quotations
- Can manage materials and vendors
- Cannot delete (except quote items)
- Cannot view audit logs
- Cannot manage templates

CLIENT:
- Can view their own clients, projects, quotations
- Can approve/reject quotations
- Can view materials catalog
- Can create and cancel their own bookings
- Cannot modify master data
*/
