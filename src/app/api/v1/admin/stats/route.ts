import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, user, clientSubscriptions, clientApiKeys, memberInvites } from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { count, eq } from "drizzle-orm";

// GET - Platform-wide stats (super admin only)
export async function GET() {
  try {
    await requireSuperAdmin();

    const [totalBusinesses] = await db.select({ total: count() }).from(clients);
    const [totalUsers] = await db.select({ total: count() }).from(user);
    const [activeSubscriptions] = await db
      .select({ total: count() })
      .from(clientSubscriptions)
      .where(eq(clientSubscriptions.status, "active"));
    const [activeApiKeys] = await db
      .select({ total: count() })
      .from(clientApiKeys)
      .where(eq(clientApiKeys.isActive, true));
    const [pendingInvites] = await db
      .select({ total: count() })
      .from(memberInvites)
      .where(eq(memberInvites.status, "pending"));

    return NextResponse.json({
      stats: {
        totalBusinesses: totalBusinesses.total,
        totalUsers: totalUsers.total,
        activeSubscriptions: activeSubscriptions.total,
        activeApiKeys: activeApiKeys.total,
        pendingInvites: pendingInvites.total,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
