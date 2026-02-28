import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { authenticateApiKey, extractApiKey } from "@/lib/auth-utils";
import { eq, and, desc, gte, lte, inArray, count, avg } from "drizzle-orm";

/**
 * Public Reviews API
 * 
 * Authentication: Bearer token (API key from Settings > API Keys)
 * 
 * GET /api/public/v1/reviews
 * 
 * Query Parameters:
 *   - profileId: string (optional) - Filter by review profile ID
 *   - platform: string (optional) - Filter by platform (google, tripadvisor, g2, etc.)
 *   - rating: number (optional) - Filter by exact star rating (1-5)
 *   - minRating: number (optional) - Filter by minimum star rating
 *   - maxRating: number (optional) - Filter by maximum star rating
 *   - sentiment: string (optional) - Filter by sentiment (positive, neutral, negative)
 *   - dateFrom: string (optional) - Filter reviews from this date (ISO 8601)
 *   - dateTo: string (optional) - Filter reviews to this date (ISO 8601)
 *   - language: string (optional) - Filter by language code (en, fr, de, etc.)
 *   - needsAction: boolean (optional) - Filter reviews needing action
 *   - page: number (optional, default: 1) - Page number
 *   - limit: number (optional, default: 20, max: 100) - Results per page
 *   - sort: string (optional, default: "reviewedAt_desc") - Sort order
 * 
 * Response:
 *   {
 *     data: Review[],
 *     meta: { total, page, limit, totalPages },
 *     summary: { avgRating, totalReviews, sentimentBreakdown }
 *   }
 */
export async function GET(request: NextRequest) {
  // Authenticate via API key
  const authHeader = request.headers.get("authorization");
  const apiKey = extractApiKey(authHeader);

  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "API key required. Pass your API key as: Authorization: Bearer YOUR_API_KEY",
        docs: "Get your API key from Settings > API Keys in your ReviewFlow dashboard.",
      },
      { status: 401 }
    );
  }

  const auth = await authenticateApiKey(apiKey);
  if (!auth) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Invalid or expired API key.",
      },
      { status: 401 }
    );
  }

  const { clientId } = auth;
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const profileId = searchParams.get("profileId");
  const platform = searchParams.get("platform");
  const rating = searchParams.get("rating") ? parseInt(searchParams.get("rating")!) : null;
  const minRating = searchParams.get("minRating") ? parseInt(searchParams.get("minRating")!) : null;
  const maxRating = searchParams.get("maxRating") ? parseInt(searchParams.get("maxRating")!) : null;
  const sentiment = searchParams.get("sentiment");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const language = searchParams.get("language");
  const needsAction = searchParams.get("needsAction");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;
  const sort = searchParams.get("sort") || "reviewedAt_desc";

  // Build conditions
  const conditions: any[] = [eq(reviews.clientId, clientId)];

  if (profileId) conditions.push(eq(reviews.profileId, profileId));
  if (platform) conditions.push(eq(reviews.platform, platform));
  if (rating !== null) conditions.push(eq(reviews.rating, rating));
  if (sentiment) conditions.push(eq(reviews.sentiment, sentiment));
  if (language) conditions.push(eq(reviews.language, language));
  if (needsAction === "true") conditions.push(eq(reviews.needsAction, true));
  if (dateFrom) {
    try {
      conditions.push(gte(reviews.reviewedAt, new Date(dateFrom)));
    } catch {}
  }
  if (dateTo) {
    try {
      conditions.push(lte(reviews.reviewedAt, new Date(dateTo)));
    } catch {}
  }

  const baseCondition = and(...conditions);

  try {
    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(reviews)
      .where(baseCondition);

    // Get reviews
    const reviewsData = await db
      .select({
        id: reviews.id,
        platform: reviews.platform,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        authorName: reviews.authorName,
        authorAvatar: reviews.authorAvatar,
        reviewUrl: reviews.reviewUrl,
        reviewedAt: reviews.reviewedAt,
        sentiment: reviews.sentiment,
        sentimentScore: reviews.sentimentScore,
        topics: reviews.topics,
        tags: reviews.tags,
        language: reviews.language,
        translatedBody: reviews.translatedBody,
        replyText: reviews.replyText,
        repliedAt: reviews.repliedAt,
        isVerified: reviews.isVerified,
        profileId: reviews.profileId,
        profileName: reviewProfiles.name,
        profileUrl: reviewProfiles.profileUrl,
        externalId: reviews.externalId,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
      .where(baseCondition)
      .orderBy(desc(reviews.reviewedAt))
      .limit(limit)
      .offset(offset);

    // Summary stats
    const [avgResult] = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(baseCondition);

    const sentimentBreakdown = await db
      .select({ sentiment: reviews.sentiment, count: count() })
      .from(reviews)
      .where(baseCondition)
      .groupBy(reviews.sentiment);

    const totalPages = Math.ceil(totalResult.count / limit);

    return NextResponse.json({
      data: reviewsData,
      meta: {
        total: totalResult.count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      summary: {
        totalReviews: totalResult.count,
        avgRating: avgResult.avg ? parseFloat(avgResult.avg as string).toFixed(2) : null,
        sentimentBreakdown: sentimentBreakdown.reduce((acc, s) => {
          if (s.sentiment) acc[s.sentiment] = s.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    console.error("Public API reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
