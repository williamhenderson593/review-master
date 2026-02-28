import { NextRequest, NextResponse } from "next/server";
import { sendEmail, newReviewAlertEmail, lowRatingAlertEmail, weeklyReviewDigestEmail, newCampaignReviewEmail } from "@/lib/email";
import { requireAuth } from "@/lib/auth-utils";
import { db } from "@/lib/db";
import { reviews, reviewProfiles, user } from "@/lib/schema";
import { eq, and, desc, gte, count, avg } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3003";

// POST - Send a review notification email
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { type, reviewId, recipients, campaignName } = body;

    if (!type || !recipients || recipients.length === 0) {
      return NextResponse.json({ error: "type and recipients are required" }, { status: 400 });
    }

    const dashboardUrl = `${APP_URL}/reviews`;
    const businessName = currentUser.client?.name || "Your Business";

    let emailHtml = "";
    let subject = "";

    switch (type) {
      case "new_review": {
        if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

        const [review] = await db
          .select({
            id: reviews.id,
            platform: reviews.platform,
            rating: reviews.rating,
            body: reviews.body,
            authorName: reviews.authorName,
            reviewUrl: reviews.reviewUrl,
            sentiment: reviews.sentiment,
          })
          .from(reviews)
          .where(and(eq(reviews.id, reviewId), eq(reviews.clientId, currentUser.clientId)));

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        subject = `New ${review.rating}★ Review on ${review.platform} — ${businessName}`;
        emailHtml = newReviewAlertEmail({
          businessName,
          platform: review.platform,
          rating: review.rating || 0,
          authorName: review.authorName || "Anonymous",
          reviewBody: review.body || "No review text",
          reviewUrl: review.reviewUrl || undefined,
          sentiment: review.sentiment || undefined,
          dashboardUrl: `${APP_URL}/reviews`,
        });
        break;
      }

      case "low_rating": {
        if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

        const [review] = await db
          .select({
            id: reviews.id,
            platform: reviews.platform,
            rating: reviews.rating,
            body: reviews.body,
            authorName: reviews.authorName,
          })
          .from(reviews)
          .where(and(eq(reviews.id, reviewId), eq(reviews.clientId, currentUser.clientId)));

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        subject = `⚠️ ${review.rating}★ Review Needs Attention — ${businessName}`;
        emailHtml = lowRatingAlertEmail({
          businessName,
          platform: review.platform,
          rating: review.rating || 1,
          authorName: review.authorName || "Anonymous",
          reviewBody: review.body || "No review text",
          dashboardUrl: `${APP_URL}/reviews`,
        });
        break;
      }

      case "weekly_digest": {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [totalResult] = await db
          .select({ count: count() })
          .from(reviews)
          .where(and(
            eq(reviews.clientId, currentUser.clientId),
            gte(reviews.reviewedAt, sevenDaysAgo)
          ));

        const [avgResult] = await db
          .select({ avg: avg(reviews.rating) })
          .from(reviews)
          .where(eq(reviews.clientId, currentUser.clientId));

        const sentimentBreakdown = await db
          .select({ sentiment: reviews.sentiment, count: count() })
          .from(reviews)
          .where(and(
            eq(reviews.clientId, currentUser.clientId),
            gte(reviews.reviewedAt, sevenDaysAgo)
          ))
          .groupBy(reviews.sentiment);

        const platformBreakdown = await db
          .select({ platform: reviews.platform, count: count() })
          .from(reviews)
          .where(eq(reviews.clientId, currentUser.clientId))
          .groupBy(reviews.platform)
          .orderBy(desc(count()));

        const [needsActionResult] = await db
          .select({ count: count() })
          .from(reviews)
          .where(and(eq(reviews.clientId, currentUser.clientId), eq(reviews.needsAction, true)));

        const positiveCount = sentimentBreakdown.find(s => s.sentiment === "positive")?.count || 0;
        const negativeCount = sentimentBreakdown.find(s => s.sentiment === "negative")?.count || 0;
        const topPlatform = platformBreakdown[0]?.platform || "N/A";

        subject = `📊 Weekly Review Summary — ${businessName}`;
        emailHtml = weeklyReviewDigestEmail({
          businessName,
          totalReviews: totalResult.count,
          avgRating: avgResult.avg ? parseFloat(avgResult.avg as string).toFixed(1) : "0.0",
          positiveCount,
          negativeCount,
          needsActionCount: needsActionResult.count,
          topPlatform,
          dashboardUrl: `${APP_URL}/dashboard`,
        });
        break;
      }

      case "campaign_review": {
        if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

        const [review] = await db
          .select({
            id: reviews.id,
            platform: reviews.platform,
            rating: reviews.rating,
            body: reviews.body,
            authorName: reviews.authorName,
          })
          .from(reviews)
          .where(and(eq(reviews.id, reviewId), eq(reviews.clientId, currentUser.clientId)));

        if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        subject = `🎉 New Campaign Review — ${businessName}`;
        emailHtml = newCampaignReviewEmail({
          businessName,
          campaignName: campaignName || "Your Campaign",
          contactName: review.authorName || "A customer",
          platform: review.platform,
          rating: review.rating || 0,
          reviewBody: review.body || "No review text",
          dashboardUrl: `${APP_URL}/campaigns`,
        });
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    // Send to all recipients
    const results = await Promise.allSettled(
      recipients.map((to: string) => sendEmail({ to, subject, html: emailHtml }))
    );

    const sent = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({ success: true, sent, failed });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Email notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
