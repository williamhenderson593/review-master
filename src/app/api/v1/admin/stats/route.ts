import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  clients, user, clientSubscriptions, clientApiKeys, memberInvites,
  reviews, reviewProfiles, campaigns, automations, integrations
} from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { count, eq, avg, sql, desc } from "drizzle-orm";

// GET - Platform-wide stats (super admin only)
export async function GET() {
  try {
    await requireSuperAdmin();

    // Core platform stats
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

    // Review platform stats
    const [totalReviews] = await db.select({ total: count() }).from(reviews);
    const [totalProfiles] = await db.select({ total: count() }).from(reviewProfiles);
    const [avgRating] = await db.select({ avg: avg(reviews.rating) }).from(reviews);
    const [totalCampaigns] = await db.select({ total: count() }).from(campaigns);
    const [activeCampaigns] = await db
      .select({ total: count() })
      .from(campaigns)
      .where(eq(campaigns.status, "active"));
    const [totalAutomations] = await db.select({ total: count() }).from(automations);
    const [activeAutomations] = await db
      .select({ total: count() })
      .from(automations)
      .where(eq(automations.isActive, true));
    const [totalIntegrations] = await db.select({ total: count() }).from(integrations);

    // Reviews needing action
    const [needsAction] = await db
      .select({ total: count() })
      .from(reviews)
      .where(eq(reviews.needsAction, true));

    // Sentiment breakdown
    const sentimentBreakdown = await db
      .select({ sentiment: reviews.sentiment, count: count() })
      .from(reviews)
      .groupBy(reviews.sentiment);

    // Reviews by platform
    const platformBreakdown = await db
      .select({ platform: reviews.platform, count: count() })
      .from(reviews)
      .groupBy(reviews.platform)
      .orderBy(desc(count()));

    // New businesses this month
    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    firstOfMonth.setHours(0, 0, 0, 0)
    const [newBusinessesThisMonth] = await db
      .select({ total: count() })
      .from(clients)
      .where(sql`${clients.createdAt} >= ${firstOfMonth}`);

    // New reviews this month
    const [newReviewsThisMonth] = await db
      .select({ total: count() })
      .from(reviews)
      .where(sql`${reviews.reviewedAt} >= ${firstOfMonth}`);

    // Subscription plan breakdown
    const planBreakdown = await db
      .select({
        status: clientSubscriptions.status,
        count: count(),
      })
      .from(clientSubscriptions)
      .groupBy(clientSubscriptions.status);

    // Top businesses by review count
    const topBusinessesByReviews = await db
      .select({
        clientId: reviews.clientId,
        clientName: clients.name,
        reviewCount: count(),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .leftJoin(clients, eq(reviews.clientId, clients.id))
      .groupBy(reviews.clientId, clients.name)
      .orderBy(desc(count()))
      .limit(10);

    // Monthly review growth (last 6 months)
    const monthlyGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(reviews)
      .where(sql`${reviews.reviewedAt} >= NOW() - INTERVAL '6 months'`)
      .groupBy(sql`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`);

    // Monthly new businesses (last 6 months)
    const monthlyBusinessGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`,
        count: count(),
      })
      .from(clients)
      .where(sql`${clients.createdAt} >= NOW() - INTERVAL '6 months'`)
      .groupBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM')`);

    return NextResponse.json({
      stats: {
        // Core
        totalBusinesses: totalBusinesses.total,
        totalUsers: totalUsers.total,
        activeSubscriptions: activeSubscriptions.total,
        activeApiKeys: activeApiKeys.total,
        pendingInvites: pendingInvites.total,
        newBusinessesThisMonth: newBusinessesThisMonth.total,
        // Reviews
        totalReviews: totalReviews.total,
        totalProfiles: totalProfiles.total,
        avgRating: avgRating.avg ? parseFloat(avgRating.avg as string).toFixed(2) : "0.00",
        needsAction: needsAction.total,
        newReviewsThisMonth: newReviewsThisMonth.total,
        // Campaigns & Automations
        totalCampaigns: totalCampaigns.total,
        activeCampaigns: activeCampaigns.total,
        totalAutomations: totalAutomations.total,
        activeAutomations: activeAutomations.total,
        totalIntegrations: totalIntegrations.total,
      },
      sentimentBreakdown,
      platformBreakdown,
      planBreakdown,
      topBusinessesByReviews: topBusinessesByReviews.map(b => ({
        ...b,
        avgRating: b.avgRating ? parseFloat(b.avgRating as string).toFixed(1) : null,
      })),
      monthlyGrowth,
      monthlyBusinessGrowth,
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
