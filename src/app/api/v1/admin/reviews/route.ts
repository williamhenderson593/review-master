import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles, clients } from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { eq, desc, and, inArray } from "drizzle-orm";

// GET - All reviews across all businesses (super admin only)
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const sentiment = searchParams.get("sentiment");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const offset = (page - 1) * limit;

    const conditions: any[] = [];
    if (platform) conditions.push(eq(reviews.platform, platform));
    if (sentiment) conditions.push(eq(reviews.sentiment, sentiment));

    const allReviews = await db
      .select({
        id: reviews.id,
        platform: reviews.platform,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        authorName: reviews.authorName,
        reviewedAt: reviews.reviewedAt,
        sentiment: reviews.sentiment,
        needsAction: reviews.needsAction,
        isFlagged: reviews.isFlagged,
        repliedAt: reviews.repliedAt,
        clientName: clients.name,
        profileName: reviewProfiles.name,
      })
      .from(reviews)
      .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
      .leftJoin(clients, eq(reviews.clientId, clients.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(reviews.reviewedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ reviews: allReviews });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
