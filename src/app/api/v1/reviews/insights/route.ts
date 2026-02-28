import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and, count, avg, sql, gte, lte, inArray } from "drizzle-orm";

// GET - Get comprehensive review insights with filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const profileIds = searchParams.get("profileIds")?.split(",").filter(Boolean) || [];
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const ratings = searchParams.get("ratings")?.split(",").map(Number).filter(Boolean) || [];
    const sentiments = searchParams.get("sentiments")?.split(",").filter(Boolean) || [];
    const topics = searchParams.get("topics")?.split(",").filter(Boolean) || [];

    // Build conditions
    const conditions: any[] = [eq(reviews.clientId, currentUser.clientId)];

    if (profileIds.length > 0) {
      conditions.push(inArray(reviews.profileId, profileIds));
    }
    if (dateFrom) {
      conditions.push(gte(reviews.reviewedAt, new Date(dateFrom)));
    }
    if (dateTo) {
      conditions.push(lte(reviews.reviewedAt, new Date(dateTo)));
    }
    if (ratings.length > 0) {
      conditions.push(inArray(reviews.rating, ratings));
    }
    if (sentiments.length > 0) {
      conditions.push(inArray(reviews.sentiment, sentiments));
    }

    const baseCondition = and(...conditions);

    // 1. Summary stats
    const [summary] = await db
      .select({
        total: count(),
        avgRating: avg(reviews.rating),
      })
      .from(reviews)
      .where(baseCondition);

    // 2. Sentiment breakdown
    const sentimentData = await db
      .select({ sentiment: reviews.sentiment, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.sentiment);

    // 3. Rating distribution
    const ratingData = await db
      .select({ rating: reviews.rating, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.rating)
      .orderBy(reviews.rating);

    // 4. Reviews over time (by month)
    const timeSeriesData = await db
      .select({
        month: sql<string>`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`,
        count: count(),
        avgRating: avg(reviews.rating),
        positive: sql<number>`COUNT(CASE WHEN ${reviews.sentiment} = 'positive' THEN 1 END)`,
        negative: sql<number>`COUNT(CASE WHEN ${reviews.sentiment} = 'negative' THEN 1 END)`,
        neutral: sql<number>`COUNT(CASE WHEN ${reviews.sentiment} = 'neutral' THEN 1 END)`,
      })
      .from(reviews)
      .where(baseCondition)
      .groupBy(sql`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${reviews.reviewedAt}, 'YYYY-MM')`);

    // 5. Topic frequency
    const allReviewsWithTopics = await db
      .select({ topics: reviews.topics })
      .from(reviews)
      .where(baseCondition);

    const topicCounts: Record<string, number> = {};
    for (const r of allReviewsWithTopics) {
      const topicList = r.topics as string[] || [];
      for (const topic of topicList) {
        if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }
    const topicData = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    // 6. Per-profile breakdown
    const profileData = await db
      .select({
        profileId: reviews.profileId,
        profileName: reviewProfiles.name,
        platform: reviews.platform,
        count: count(),
        avgRating: avg(reviews.rating),
        positive: sql<number>`COUNT(CASE WHEN ${reviews.sentiment} = 'positive' THEN 1 END)`,
        negative: sql<number>`COUNT(CASE WHEN ${reviews.sentiment} = 'negative' THEN 1 END)`,
      })
      .from(reviews)
      .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
      .where(baseCondition)
      .groupBy(reviews.profileId, reviewProfiles.name, reviews.platform);

    // 7. Language distribution
    const languageData = await db
      .select({ language: reviews.language, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.language)
      .orderBy(count());

    // 8. Response rate
    const [repliedCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(baseCondition, sql`${reviews.repliedAt} IS NOT NULL`));

    // 9. Needs action count
    const [needsActionCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(baseCondition, eq(reviews.needsAction, true)));

    // 10. Recent reviews sample (for word cloud / testimonials)
    const recentReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        body: reviews.body,
        authorName: reviews.authorName,
        sentiment: reviews.sentiment,
        topics: reviews.topics,
        platform: reviews.platform,
        reviewedAt: reviews.reviewedAt,
        profileName: reviewProfiles.name,
      })
      .from(reviews)
      .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
      .where(baseCondition)
      .orderBy(sql`${reviews.reviewedAt} DESC NULLS LAST`)
      .limit(50);

    return NextResponse.json({
      summary: {
        total: summary.total,
        avgRating: summary.avgRating ? parseFloat(summary.avgRating as string).toFixed(2) : "0.00",
        responseRate: summary.total > 0 ? Math.round((repliedCount.count / summary.total) * 100) : 0,
        needsAction: needsActionCount.count,
      },
      sentimentData,
      ratingData,
      timeSeriesData,
      topicData,
      profileData: profileData.map(p => ({
        ...p,
        avgRating: p.avgRating ? parseFloat(p.avgRating as string).toFixed(1) : null,
      })),
      languageData,
      recentReviews,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
