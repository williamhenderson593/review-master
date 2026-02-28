import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewProfiles } from "@/lib/schema";
import { authenticateApiKey, extractApiKey } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";

/**
 * Public Review Profiles API
 * 
 * GET /api/public/v1/profiles
 * Returns all review profiles for the authenticated organization.
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

  try {
    const profiles = await db
      .select({
        id: reviewProfiles.id,
        name: reviewProfiles.name,
        platform: reviewProfiles.platform,
        platformProfileId: reviewProfiles.platformProfileId,
        profileUrl: reviewProfiles.profileUrl,
        isActive: reviewProfiles.isActive,
        isCompetitor: reviewProfiles.isCompetitor,
        syncStatus: reviewProfiles.syncStatus,
        lastSyncedAt: reviewProfiles.lastSyncedAt,
        createdAt: reviewProfiles.createdAt,
      })
      .from(reviewProfiles)
      .where(eq(reviewProfiles.clientId, auth.clientId))
      .orderBy(desc(reviewProfiles.createdAt));

    return NextResponse.json({ data: profiles, meta: { total: profiles.length } });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
