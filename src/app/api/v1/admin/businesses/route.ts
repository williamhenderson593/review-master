import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, user, clientSubscriptions, subscriptionPlans } from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { eq, count, sql } from "drizzle-orm";

// GET - List all businesses (super admin only)
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // Get all businesses with member count and subscription info
    const businesses = await db
      .select({
        id: clients.id,
        name: clients.name,
        slug: clients.slug,
        email: clients.email,
        phone: clients.phone,
        country: clients.country,
        website: clients.website,
        createdAt: clients.createdAt,
        memberCount: sql<number>`(SELECT COUNT(*) FROM "user" WHERE "user"."client_id" = ${clients.id})`.as("member_count"),
      })
      .from(clients)
      .orderBy(clients.createdAt)
      .limit(limit)
      .offset(offset);

    // Get subscription info for each business
    const businessesWithSubs = await Promise.all(
      businesses.map(async (biz) => {
        const sub = await db
          .select({
            status: clientSubscriptions.status,
            planName: subscriptionPlans.name,
          })
          .from(clientSubscriptions)
          .innerJoin(subscriptionPlans, eq(clientSubscriptions.planId, subscriptionPlans.id))
          .where(eq(clientSubscriptions.clientId, biz.id))
          .limit(1);

        return {
          ...biz,
          subscription: sub.length ? sub[0] : null,
        };
      })
    );

    const totalResult = await db.select({ total: count() }).from(clients);
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      businesses: businessesWithSubs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Admin businesses error:", error);
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
  }
}
