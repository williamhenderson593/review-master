import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateToken(length = 16): string {
  return randomBytes(length).toString("hex").slice(0, length);
}

// GET - List all campaigns
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const allCampaigns = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.clientId, currentUser.clientId))
      .orderBy(desc(campaigns.createdAt));

    return NextResponse.json({ campaigns: allCampaigns });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

// POST - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const {
      name, type, targetPlatforms, subject, messageTemplate,
      triggerEvent, isIncentivized, incentiveDetails,
      reputationProtection, reputationThreshold
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    // Generate magic link URL
    const token = generateToken(16);
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3003"}/r/${token}`;

    const [campaign] = await db
      .insert(campaigns)
      .values({
        clientId: currentUser.clientId,
        name,
        type: type || "email",
        targetPlatforms: targetPlatforms || [],
        subject,
        messageTemplate,
        magicLinkUrl,
        triggerEvent,
        isIncentivized: isIncentivized || false,
        incentiveDetails,
        reputationProtection: reputationProtection || false,
        reputationThreshold: reputationThreshold || 3,
        status: "draft",
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
