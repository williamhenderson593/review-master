import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrations } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";

// GET - List all integrations
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const allIntegrations = await db
      .select({
        id: integrations.id,
        type: integrations.type,
        name: integrations.name,
        isActive: integrations.isActive,
        lastUsedAt: integrations.lastUsedAt,
        createdAt: integrations.createdAt,
        // Don't expose credentials
        config: integrations.config,
      })
      .from(integrations)
      .where(eq(integrations.clientId, currentUser.clientId))
      .orderBy(desc(integrations.createdAt));

    return NextResponse.json({ integrations: allIntegrations });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch integrations" }, { status: 500 });
  }
}

// POST - Create a new integration
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { type, name, config, credentials } = body;

    if (!type || !name) {
      return NextResponse.json({ error: "Type and name are required" }, { status: 400 });
    }

    const [integration] = await db
      .insert(integrations)
      .values({
        clientId: currentUser.clientId,
        type,
        name,
        config,
        credentials,
        isActive: true,
        createdBy: currentUser.id,
      })
      .returning();

    // Don't return credentials
    const { credentials: _creds, ...safeIntegration } = integration;

    return NextResponse.json({ integration: safeIntegration }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create integration" }, { status: 500 });
  }
}
