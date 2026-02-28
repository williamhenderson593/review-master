import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, user, roles, clientSubscriptions, subscriptionPlans, clientApiKeys, memberInvites } from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

// GET - Get a single business with full details (super admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
    const { id } = await params;

    const business = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!business.length) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Get members
    const members = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        emailVerified: user.emailVerified,
        roleName: roles.name,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(roles, eq(user.roleId, roles.id))
      .where(eq(user.clientId, id));

    // Get subscription
    const subscription = await db
      .select({
        id: clientSubscriptions.id,
        status: clientSubscriptions.status,
        planName: subscriptionPlans.name,
        planPrice: subscriptionPlans.priceMonthly,
        currentPeriodStart: clientSubscriptions.currentPeriodStart,
        currentPeriodEnd: clientSubscriptions.currentPeriodEnd,
      })
      .from(clientSubscriptions)
      .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
      .where(eq(clientSubscriptions.clientId, id))
      .limit(1);

    // Get API keys count
    const apiKeys = await db
      .select({
        id: clientApiKeys.id,
        name: clientApiKeys.name,
        keyPrefix: clientApiKeys.keyPrefix,
        isActive: clientApiKeys.isActive,
        createdAt: clientApiKeys.createdAt,
        lastUsedAt: clientApiKeys.lastUsedAt,
      })
      .from(clientApiKeys)
      .where(eq(clientApiKeys.clientId, id));

    // Get pending invites
    const invites = await db
      .select({
        id: memberInvites.id,
        email: memberInvites.email,
        status: memberInvites.status,
        createdAt: memberInvites.createdAt,
      })
      .from(memberInvites)
      .where(eq(memberInvites.clientId, id));

    return NextResponse.json({
      business: business[0],
      members,
      subscription: subscription.length ? subscription[0] : null,
      apiKeys,
      invites,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Admin business detail error:", error);
    return NextResponse.json({ error: "Failed to fetch business" }, { status: 500 });
  }
}
