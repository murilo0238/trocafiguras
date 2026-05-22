
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

DO $$ BEGIN
  CREATE TYPE public.admin_permission AS ENUM (
    'list_users',
    'reset_password',
    'ban_user',
    'delete_user',
    'edit_profile',
    'manage_admins'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
