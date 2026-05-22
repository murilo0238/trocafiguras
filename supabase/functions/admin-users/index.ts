import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const ALL_PERMS = [
  "list_users", "reset_password", "ban_user", "delete_user", "edit_profile", "manage_admins"
] as const;
type Perm = typeof ALL_PERMS[number];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const caller = userData?.user;
    if (!caller) return json({ error: "Unauthorized" }, 401);

    // Load caller roles + permissions
    const { data: roleRows } = await admin
      .from("user_roles").select("role").eq("user_id", caller.id);
    const roles = (roleRows || []).map((r) => r.role);
    const isSuper = roles.includes("super_admin");
    const isAdmin = roles.includes("admin") || isSuper;
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const { data: permRows } = await admin
      .from("admin_permissions").select("permission").eq("user_id", caller.id);
    const grantedPerms = new Set<Perm>((permRows || []).map((p) => p.permission));
    const can = (p: Perm) => isSuper || grantedPerms.has(p);

    const { action, payload = {} } = await req.json();

    const audit = async (act: string, target?: string, details?: unknown) => {
      await admin.from("admin_audit_log").insert({
        admin_id: caller.id, action: act, target_user_id: target ?? null,
        details: details ?? null,
      });
    };

    switch (action) {
      case "me":
        return json({
          isSuper, isAdmin,
          permissions: isSuper ? [...ALL_PERMS] : [...grantedPerms],
        });

      case "list_users": {
        if (!can("list_users")) return json({ error: "Forbidden" }, 403);
        const page = Number(payload.page ?? 1);
        const perPage = Math.min(Number(payload.perPage ?? 50), 200);
        const search = String(payload.search ?? "").toLowerCase().trim();
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
        if (error) return json({ error: error.message }, 500);
        const ids = data.users.map((u) => u.id);
        const [{ data: profiles }, { data: rolesData }, { data: banned }] = await Promise.all([
          admin.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids),
          admin.from("user_roles").select("user_id, role").in("user_id", ids),
          admin.from("banned_users").select("user_id, reason, created_at").in("user_id", ids),
        ]);
        const profMap = new Map((profiles || []).map((p) => [p.user_id, p]));
        const roleMap = new Map<string, string[]>();
        for (const r of rolesData || []) {
          const arr = roleMap.get(r.user_id) || [];
          arr.push(r.role);
          roleMap.set(r.user_id, arr);
        }
        const banMap = new Map((banned || []).map((b) => [b.user_id, b]));
        let users = data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          display_name: profMap.get(u.id)?.display_name ?? null,
          avatar_url: profMap.get(u.id)?.avatar_url ?? null,
          roles: roleMap.get(u.id) || [],
          banned: banMap.get(u.id) ?? null,
        }));
        if (search) {
          users = users.filter((u) =>
            (u.email || "").toLowerCase().includes(search) ||
            (u.display_name || "").toLowerCase().includes(search)
          );
        }
        return json({ users, total: data.total ?? users.length });
      }

      case "reset_password": {
        if (!can("reset_password")) return json({ error: "Forbidden" }, 403);
        const email = String(payload.email || "");
        if (!email) return json({ error: "email required" }, 400);
        const { error } = await admin.auth.resetPasswordForEmail(email, {
          redirectTo: `${payload.origin || ""}/reset-password`,
        });
        if (error) return json({ error: error.message }, 500);
        await audit("reset_password", payload.user_id, { email });
        return json({ ok: true });
      }

      case "ban_user": {
        if (!can("ban_user")) return json({ error: "Forbidden" }, 403);
        const target = String(payload.user_id || "");
        const reason = String(payload.reason || "");
        if (!target) return json({ error: "user_id required" }, 400);
        await admin.from("banned_users").upsert({
          user_id: target, reason, banned_by: caller.id,
        });
        // Disable login via auth
        await admin.auth.admin.updateUserById(target, { ban_duration: "876000h" });
        await audit("ban_user", target, { reason });
        return json({ ok: true });
      }

      case "unban_user": {
        if (!can("ban_user")) return json({ error: "Forbidden" }, 403);
        const target = String(payload.user_id || "");
        if (!target) return json({ error: "user_id required" }, 400);
        await admin.from("banned_users").delete().eq("user_id", target);
        await admin.auth.admin.updateUserById(target, { ban_duration: "none" });
        await audit("unban_user", target);
        return json({ ok: true });
      }

      case "delete_user": {
        if (!can("delete_user")) return json({ error: "Forbidden" }, 403);
        const target = String(payload.user_id || "");
        if (!target) return json({ error: "user_id required" }, 400);
        if (target === caller.id) return json({ error: "Cannot delete yourself" }, 400);
        const { data: tRoles } = await admin.from("user_roles").select("role").eq("user_id", target);
        if ((tRoles || []).some((r) => r.role === "super_admin"))
          return json({ error: "Cannot delete a super admin" }, 400);
        const { error } = await admin.auth.admin.deleteUser(target);
        if (error) return json({ error: error.message }, 500);
        await audit("delete_user", target);
        return json({ ok: true });
      }

      case "edit_profile": {
        if (!can("edit_profile")) return json({ error: "Forbidden" }, 403);
        const target = String(payload.user_id || "");
        const patch = payload.patch || {};
        if (!target) return json({ error: "user_id required" }, 400);
        const allowed: Record<string, unknown> = {};
        for (const k of ["display_name", "city", "state"]) {
          if (k in patch) allowed[k] = patch[k];
        }
        if (Object.keys(allowed).length === 0) return json({ error: "nothing to update" }, 400);
        await admin.from("profiles").update(allowed).eq("user_id", target);
        await audit("edit_profile", target, allowed);
        return json({ ok: true });
      }

      case "grant_admin": {
        if (!isSuper) return json({ error: "Only super admin" }, 403);
        const target = String(payload.user_id || "");
        const perms: Perm[] = Array.isArray(payload.permissions) ? payload.permissions : [];
        if (!target) return json({ error: "user_id required" }, 400);
        await admin.from("user_roles").upsert(
          { user_id: target, role: "admin" },
          { onConflict: "user_id,role" }
        );
        await admin.from("admin_permissions").delete().eq("user_id", target);
        if (perms.length) {
          const rows = perms
            .filter((p) => ALL_PERMS.includes(p))
            .map((p) => ({ user_id: target, permission: p, granted_by: caller.id }));
          if (rows.length) await admin.from("admin_permissions").insert(rows);
        }
        await audit("grant_admin", target, { permissions: perms });
        return json({ ok: true });
      }

      case "revoke_admin": {
        if (!isSuper) return json({ error: "Only super admin" }, 403);
        const target = String(payload.user_id || "");
        if (!target) return json({ error: "user_id required" }, 400);
        await admin.from("user_roles").delete().eq("user_id", target).eq("role", "admin");
        await admin.from("admin_permissions").delete().eq("user_id", target);
        await audit("revoke_admin", target);
        return json({ ok: true });
      }

      case "list_admins": {
        if (!isSuper) return json({ error: "Only super admin" }, 403);
        const { data: rolesData } = await admin
          .from("user_roles").select("user_id, role")
          .in("role", ["admin", "super_admin"]);
        const ids = [...new Set((rolesData || []).map((r) => r.user_id))];
        if (ids.length === 0) return json({ admins: [] });
        const [{ data: profiles }, { data: perms }, usersRes] = await Promise.all([
          admin.from("profiles").select("user_id, display_name, avatar_url").in("user_id", ids),
          admin.from("admin_permissions").select("user_id, permission").in("user_id", ids),
          admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
        ]);
        const profMap = new Map((profiles || []).map((p) => [p.user_id, p]));
        const emailMap = new Map((usersRes.data?.users || []).map((u) => [u.id, u.email]));
        const permMap = new Map<string, Perm[]>();
        for (const p of perms || []) {
          const arr = permMap.get(p.user_id) || [];
          arr.push(p.permission as Perm);
          permMap.set(p.user_id, arr);
        }
        const adminsList = ids.map((id) => ({
          user_id: id,
          email: emailMap.get(id) ?? null,
          display_name: profMap.get(id)?.display_name ?? null,
          avatar_url: profMap.get(id)?.avatar_url ?? null,
          is_super: (rolesData || []).some((r) => r.user_id === id && r.role === "super_admin"),
          permissions: permMap.get(id) || [],
        }));
        return json({ admins: adminsList });
      }

      case "audit_log": {
        if (!isSuper) return json({ error: "Only super admin" }, 403);
        const limit = Math.min(Number(payload.limit ?? 100), 500);
        const { data } = await admin
          .from("admin_audit_log")
          .select("id, admin_id, action, target_user_id, details, created_at")
          .order("created_at", { ascending: false })
          .limit(limit);
        return json({ log: data || [] });
      }

      default:
        return json({ error: "Unknown action" }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});
