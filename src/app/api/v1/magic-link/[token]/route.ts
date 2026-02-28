import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { campaigns, clients } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

// GET - Resolve a magic link token to campaign data
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    // Find campaign by magic link URL containing this token
    const [campaign] = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        targetPlatforms: campaigns.targetPlatforms,
        reputationProtection: campaigns.reputationProtection,
        reputationThreshold: campaigns.reputationThreshold,
        messageTemplate: campaigns.messageTemplate,
        status: campaigns.status,
        clientId: campaigns.clientId,
      })
      .from(campaigns)
      .where(sql`${campaigns.magicLinkUrl} LIKE ${'%' + token + '%'}`);

    if (!campaign) {
      return NextResponse.json({ error: "Magic link not found or expired" }, { status: 404 });
    }

    if (campaign.status !== "active") {
      return NextResponse.json({ error: "This campaign is no longer active" }, { status: 410 });
    }

    // Get business info
    const [business] = await db
      .select({ name: clients.name, logoUrl: clients.logoUrl })
      .from(clients)
      .where(eq(clients.id, campaign.clientId));

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        targetPlatforms: campaign.targetPlatforms || [],
        reputationProtection: campaign.reputationProtection,
        reputationThreshold: campaign.reputationThreshold,
        messageTemplate: campaign.messageTemplate,
      },
      business: {
        name: business?.name || "Our Business",
        logoUrl: business?.logoUrl || null,
      },
    });
  } catch (error: any) {
    console.error("Magic link error:", error);
    return NextResponse.json({ error: "Failed to load magic link" }, { status: 500 });
  }
}
