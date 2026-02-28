import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and, desc } from "drizzle-orm";

// GET - List all review profiles for the current client
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const profiles = await db
      .select()
      .from(reviewProfiles)
      .where(eq(reviewProfiles.clientId, currentUser.clientId))
      .orderBy(desc(reviewProfiles.createdAt));

    return NextResponse.json({ profiles });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch review profiles" }, { status: 500 });
  }
}

// POST - Create a new review profile
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { name, platform, platformProfileId, profileUrl, logoUrl, isCompetitor } = body;

    if (!name || !platform) {
      return NextResponse.json({ error: "Name and platform are required" }, { status: 400 });
    }

    const [profile] = await db
      .insert(reviewProfiles)
      .values({
        clientId: currentUser.clientId,
        name,
        platform,
        platformProfileId,
        profileUrl,
        logoUrl,
        isCompetitor: isCompetitor || false,
        syncStatus: "pending",
      })
      .returning();

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create review profile" }, { status: 500 });
  }
}
