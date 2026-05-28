-- Add show_in_trades flag to profiles.
-- Only hide accounts with 'admin' role — super_admin users (the real owner)
-- keep show_in_trades = true and continue appearing in trades normally.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS show_in_trades boolean NOT NULL DEFAULT true;

UPDATE public.profiles
SET show_in_trades = false
WHERE user_id IN (
  SELECT user_id FROM public.user_roles
  WHERE role = 'admin'::public.app_role  -- only admin, NOT super_admin
);

CREATE OR REPLACE FUNCTION public.hide_admin_from_trades()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only hide plain 'admin' accounts, not super_admin (app owner)
  IF NEW.role = 'admin'::public.app_role THEN
    UPDATE public.profiles SET show_in_trades = false WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_admin_role_granted ON public.user_roles;
CREATE TRIGGER on_admin_role_granted
AFTER INSERT ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.hide_admin_from_trades();
