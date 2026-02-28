import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automations } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";

// GET - List all automations
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const allAutomations = await db
      .select()
      .from(automations)
      .where(eq(automations.clientId, currentUser.clientId))
      .orderBy(desc(automations.createdAt));

    return NextResponse.json({ automations: allAutomations });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch automations" }, { status: 500 });
  }
}

// POST - Create a new automation
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, triggerType, triggerConditions, actionType, actionConfig } = body;

    if (!name || !triggerType || !actionType) {
      return NextResponse.json({ error: "Name, triggerType, and actionType are required" }, { status: 400 });
    }

    const [automation] = await db
      .insert(automations)
      .values({
        clientId: currentUser.clientId,
        name,
        description,
        triggerType,
        triggerConditions,
        actionType,
        actionConfig,
        isActive: true,
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json({ automation }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create automation" }, { status: 500 });
  }
}
