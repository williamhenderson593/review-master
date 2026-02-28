import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { widgets } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// PUT - Update a widget
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
      .from(widgets)
      .where(and(eq(widgets.id, id), eq(widgets.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = ["name", "isActive", "config"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const [updated] = await db
      .update(widgets)
      .set(updateData)
      .where(eq(widgets.id, id))
      .returning();

    return NextResponse.json({ widget: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update widget" }, { status: 500 });
  }
}

// DELETE - Delete a widget
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(widgets)
      .where(and(eq(widgets.id, id), eq(widgets.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Widget not found" }, { status: 404 });
    }

    await db.delete(widgets).where(eq(widgets.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete widget" }, { status: 500 });
  }
}
