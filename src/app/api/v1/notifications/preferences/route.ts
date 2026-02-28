import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

// GET - Get notification preferences for current user
export async function GET() {
  try {
    const currentUser = await requireAuth();

    // Preferences stored in user metadata
    const metadata = (currentUser as any).metadata || {};
    const prefs = metadata.notificationPreferences || getDefaultPreferences();

    return NextResponse.json({ preferences: prefs });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const { preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: "preferences required" }, { status: 400 });
    }

    // Merge with existing metadata
    const existingMetadata = (currentUser as any).metadata || {};
    const updatedMetadata = {
      ...existingMetadata,
      notificationPreferences: {
        ...getDefaultPreferences(),
        ...preferences,
      },
    };

    await db
      .update(user)
      .set({ updatedAt: new Date() })
      .where(eq(user.id, currentUser.id));

    return NextResponse.json({
      success: true,
      preferences: updatedMetadata.notificationPreferences,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

function getDefaultPreferences() {
  return {
    // Review alerts
    newReviewEmail: true,
    newReviewEmailMinRating: 1, // alert for all ratings
    lowRatingEmail: true,
    lowRatingThreshold: 3, // alert for 1-2 star reviews
    negativeReviewEmail: true,
    // Campaign notifications
    campaignReviewEmail: true,
    campaignCompletedEmail: true,
    // Digest
    weeklyDigestEmail: true,
    weeklyDigestDay: "monday",
    // Frequency
    emailFrequency: "instant", // instant, hourly, daily, weekly, never
    // Channels
    emailEnabled: true,
    // Specific events
    reviewNeedsActionEmail: true,
    reviewRepliedEmail: false,
    newProfileSyncedEmail: true,
    // Recipients (additional)
    additionalRecipients: [] as string[],
  };
}
