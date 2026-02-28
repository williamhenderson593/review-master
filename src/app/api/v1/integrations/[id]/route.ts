import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrations } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// PUT - Update an integration
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
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = ["name", "isActive", "config", "credentials"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const [updated] = await db
      .update(integrations)
      .set(updateData)
      .where(eq(integrations.id, id))
      .returning();

    const { credentials: _creds, ...safeIntegration } = updated;
    return NextResponse.json({ integration: safeIntegration });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update integration" }, { status: 500 });
  }
}

// DELETE - Delete an integration
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(integrations)
      .where(and(eq(integrations.id, id), eq(integrations.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    await db.delete(integrations).where(eq(integrations.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete integration" }, { status: 500 });
  }
}
