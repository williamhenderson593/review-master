import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user, clients, roles } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  if (!users.length) return null;

  const u = users[0];

  let client = null;
  if (u.clientId) {
    const c = await db.select().from(clients).where(eq(clients.id, u.clientId)).limit(1);
    if (c.length) client = c[0];
  }

  let role = null;
  if (u.roleId) {
    const r = await db.select().from(roles).where(eq(roles.id, u.roleId)).limit(1);
    if (r.length) role = r[0];
  }

  return { ...u, client, role, session };
}

export async function requireAuth() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }
  return currentUser;
}

export async function requireBusinessAdmin() {
  const currentUser = await requireAuth();
  if (currentUser.role?.name !== "business_admin") {
    throw new Error("Forbidden: Business admin access required");
  }
  return currentUser;
}

export async function requireSuperAdmin() {
  const currentUser = await requireAuth();
  if (currentUser.role?.name !== "super_admin") {
    throw new Error("Forbidden: Super admin access required");
  }
  return currentUser;
}

export function isSuperAdmin(roleName: string | null | undefined): boolean {
  return roleName === "super_admin";
}
