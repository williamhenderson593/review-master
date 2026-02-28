import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and, count, avg, sql } from "drizzle-orm";

// GET - Get review statistics for the dashboard (optionally filtered by profileId)
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    // Build base condition
    const baseCondition = profileId
      ? and(eq(reviews.clientId, currentUser.clientId), eq(reviews.profileId, profileId))
      : eq(reviews.clientId, currentUser.clientId);

    // Total reviews
    const [totalResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(baseCondition);

    // Average rating
    const [avgResult] = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(baseCondition);

    // Sentiment breakdown
    const sentimentBreakdown = await db
      .select({
        sentiment: reviews.sentiment,
        count: count(),
      })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.sentiment);

    // Reviews by platform
    const platformBreakdown = await db
      .select({
        platform: reviews.platform,
        count: count(),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.platform);

    // Reviews needing action
    const [needsActionResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(baseCondition, eq(reviews.needsAction, true)));

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(
        and(
          baseCondition,
          sql`${reviews.reviewedAt} >= ${thirtyDaysAgo}`
        )
      );

    // Reviews by rating
    const ratingBreakdown = await db
      .select({
        rating: reviews.rating,
        count: count(),
      })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);

    // Per-profile breakdown (only when not filtering by profile)
    let profileBreakdown: Array<{ profileId: string; profileName: string; count: number; avgRating: string | null }> = [];
    if (!profileId) {
      const profileStats = await db
        .select({
          profileId: reviews.profileId,
          profileName: reviewProfiles.name,
          count: count(),
          avgRating: avg(reviews.rating),
        })
        .from(reviews)
        .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
        .where(eq(reviews.clientId, currentUser.clientId))
        .groupBy(reviews.profileId, reviewProfiles.name);

      profileBreakdown = profileStats.map(p => ({
        profileId: p.profileId,
        profileName: p.profileName || "Unknown Profile",
        count: p.count,
        avgRating: p.avgRating ? parseFloat(p.avgRating as string).toFixed(1) : null,
      }));
    }

    return NextResponse.json({
      totalReviews: totalResult.count,
      averageRating: avgResult.avg ? parseFloat(avgResult.avg as string).toFixed(1) : "0.0",
      needsAction: needsActionResult.count,
      recentReviews: recentResult.count,
      sentimentBreakdown,
      platformBreakdown,
      ratingBreakdown,
      profileBreakdown,
      filteredByProfile: profileId || null,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch review stats" }, { status: 500 });
  }
}
