import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { automations } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// PUT - Update an automation
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(automations)
      .where(and(eq(automations.id, id), eq(automations.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = [
      "name", "description", "isActive", "triggerType", "triggerConditions",
      "actionType", "actionConfig"
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const [updated] = await db
      .update(automations)
      .set(updateData)
      .where(eq(automations.id, id))
      .returning();

    return NextResponse.json({ automation: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update automation" }, { status: 500 });
  }
}

// DELETE - Delete an automation
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(automations)
      .where(and(eq(automations.id, id), eq(automations.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 });
    }

    await db.delete(automations).where(eq(automations.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete automation" }, { status: 500 });
  }
}
