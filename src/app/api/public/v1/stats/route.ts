import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { authenticateApiKey, extractApiKey } from "@/lib/auth-utils";
import { eq, and, count, avg, gte, lte } from "drizzle-orm";

/**
 * Public Review Stats API
 * 
 * GET /api/public/v1/stats
 * Returns review statistics for the authenticated organization.
 * 
 * Query Parameters:
 *   - profileId: string (optional) - Filter by review profile ID
 *   - dateFrom: string (optional) - Filter from date (ISO 8601)
 *   - dateTo: string (optional) - Filter to date (ISO 8601)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const apiKey = extractApiKey(authHeader);

  if (!apiKey) {
    return NextResponse.json(
      { error: "Unauthorized", message: "API key required. Pass: Authorization: Bearer YOUR_API_KEY" },
      { status: 401 }
    );
  }

  const auth = await authenticateApiKey(apiKey);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized", message: "Invalid or expired API key." }, { status: 401 });
  }

  const { clientId } = auth;
  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profileId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const conditions: any[] = [eq(reviews.clientId, clientId)];
  if (profileId) conditions.push(eq(reviews.profileId, profileId));
  if (dateFrom) {
    try { conditions.push(gte(reviews.reviewedAt, new Date(dateFrom))); } catch {}
  }
  if (dateTo) {
    try { conditions.push(lte(reviews.reviewedAt, new Date(dateTo))); } catch {}
  }

  const baseCondition = and(...conditions);

  try {
    const [totalResult] = await db.select({ count: count() }).from(reviews).where(baseCondition);
    const [avgResult] = await db.select({ avg: avg(reviews.rating) }).from(reviews).where(baseCondition);

    const sentimentBreakdown = await db
      .select({ sentiment: reviews.sentiment, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.sentiment);

    const ratingBreakdown = await db
      .select({ rating: reviews.rating, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);

    const platformBreakdown = await db
      .select({ platform: reviews.platform, count: count(), avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.platform);

    const [repliedCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(baseCondition, eq(reviews.needsAction, false)));

    return NextResponse.json({
      data: {
        totalReviews: totalResult.count,
        avgRating: avgResult.avg ? parseFloat(avgResult.avg as string).toFixed(2) : null,
        responseRate: totalResult.count > 0
          ? Math.round((repliedCount.count / totalResult.count) * 100)
          : 0,
        sentimentBreakdown: sentimentBreakdown.reduce((acc, s) => {
          if (s.sentiment) acc[s.sentiment] = s.count;
          return acc;
        }, {} as Record<string, number>),
        ratingBreakdown: ratingBreakdown.reduce((acc, r) => {
          if (r.rating) acc[r.rating] = r.count;
          return acc;
        }, {} as Record<number, number>),
        platformBreakdown: platformBreakdown.map(p => ({
          platform: p.platform,
          count: p.count,
          avgRating: p.avgRating ? parseFloat(p.avgRating as string).toFixed(2) : null,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
