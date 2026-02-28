import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and, desc, ilike, gte, lte, inArray, or } from "drizzle-orm";

// GET - List reviews with filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const rating = searchParams.get("rating");
    const sentiment = searchParams.get("sentiment");
    const keyword = searchParams.get("keyword");
    const needsAction = searchParams.get("needsAction");
    const profileId = searchParams.get("profileId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    const conditions = [eq(reviews.clientId, currentUser.clientId)];

    if (platform) conditions.push(eq(reviews.platform, platform));
    if (rating) conditions.push(eq(reviews.rating, parseInt(rating)));
    if (sentiment) conditions.push(eq(reviews.sentiment, sentiment));
    if (needsAction === "true") conditions.push(eq(reviews.needsAction, true));
    if (profileId) conditions.push(eq(reviews.profileId, profileId));

    const allReviews = await db
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
        topics: reviews.topics,
        tags: reviews.tags,
        language: reviews.language,
        translatedBody: reviews.translatedBody,
        needsAction: reviews.needsAction,
        actionNote: reviews.actionNote,
        replyText: reviews.replyText,
        repliedAt: reviews.repliedAt,
        isFlagged: reviews.isFlagged,
        isVerified: reviews.isVerified,
        profileId: reviews.profileId,
        createdAt: reviews.createdAt,
        profileName: reviewProfiles.name,
      })
      .from(reviews)
      .leftJoin(reviewProfiles, eq(reviews.profileId, reviewProfiles.id))
      .where(and(...conditions))
      .orderBy(desc(reviews.reviewedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ reviews: allReviews, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Create a review (manual entry)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { profileId, platform, rating, title, reviewBody, authorName, reviewedAt } = body;

    if (!profileId || !platform || !rating) {
      return NextResponse.json({ error: "profileId, platform, and rating are required" }, { status: 400 });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        clientId: currentUser.clientId,
        profileId,
        platform,
        rating,
        title,
        body: reviewBody,
        authorName,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : new Date(),
        sentiment: rating >= 4 ? "positive" : rating === 3 ? "neutral" : "negative",
      })
      .returning();

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
