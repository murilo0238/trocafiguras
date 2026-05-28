-- Add show_in_trades flag to profiles to hide admin accounts from the trading panel
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_in_trades boolean NOT NULL DEFAULT true;

-- Hide any existing admin / super_admin users from trades
UPDATE public.profiles
SET show_in_trades = false
WHERE user_id IN (
  SELECT user_id FROM public.user_roles
  WHERE role IN ('admin'::public.app_role, 'super_admin'::public.app_role)
);

-- Trigger: whenever a user is granted an admin role, hide them from trades automatically
CREATE OR REPLACE FUNCTION public.hide_admin_from_trades()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IN ('admin'::public.app_role, 'super_admin'::public.app_role) THEN
    UPDATE public.profiles SET show_in_trades = false WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_admin_role_granted ON public.user_roles;
CREATE TRIGGER on_admin_role_granted
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.hide_admin_from_trades();
