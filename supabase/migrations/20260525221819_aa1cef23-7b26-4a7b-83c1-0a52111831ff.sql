
-- 1. Wipe all user data (in correct order)
DELETE FROM public.admin_audit_log;
DELETE FROM public.admin_permissions;
DELETE FROM public.banned_users;
DELETE FROM public.trade_messages;
DELETE FROM public.trade_requests;
DELETE FROM public.direct_messages;
DELETE FROM public.friendships;
DELETE FROM public.user_stickers;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- 2. Relax RLS: any authenticated user can see all profiles and all stickers
DROP POLICY IF EXISTS "Users can view profiles that share location" ON public.profiles;
CREATE POLICY "Authenticated can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can view stickers of location-sharing users" ON public.user_stickers;
DROP POLICY IF EXISTS "Users can view stickers of users sharing collection" ON public.user_stickers;
CREATE POLICY "Authenticated can view all stickers"
ON public.user_stickers FOR SELECT TO authenticated
USING (true);

-- 3. Update handle_new_user trigger to grant super_admin to the main admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, share_collection, share_location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    true,
    false
  );

  IF NEW.email = 'murilolacerda020283@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
