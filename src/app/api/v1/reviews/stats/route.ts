import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and, count, avg, sql } from "drizzle-orm";

// GET - Get review statistics for the dashboard
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    // Total reviews
    const [totalResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(eq(reviews.clientId, currentUser.clientId));

    // Average rating
    const [avgResult] = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.clientId, currentUser.clientId));

    // Sentiment breakdown
    const sentimentBreakdown = await db
      .select({
        sentiment: reviews.sentiment,
        count: count(),
      })
      .from(reviews)
      .where(eq(reviews.clientId, currentUser.clientId))
      .groupBy(reviews.sentiment);

    // Reviews by platform
    const platformBreakdown = await db
      .select({
        platform: reviews.platform,
        count: count(),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(eq(reviews.clientId, currentUser.clientId))
      .groupBy(reviews.platform);

    // Reviews needing action
    const [needsActionResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.clientId, currentUser.clientId), eq(reviews.needsAction, true)));

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(
        and(
          eq(reviews.clientId, currentUser.clientId),
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
      .where(eq(reviews.clientId, currentUser.clientId))
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);

    return NextResponse.json({
      totalReviews: totalResult.count,
      averageRating: avgResult.avg ? parseFloat(avgResult.avg as string).toFixed(1) : "0.0",
      needsAction: needsActionResult.count,
      recentReviews: recentResult.count,
      sentimentBreakdown,
      platformBreakdown,
      ratingBreakdown,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch review stats" }, { status: 500 });
  }
}
