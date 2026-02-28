import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// PUT - Update a contact
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
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = ["firstName", "lastName", "email", "phone", "company", "jobTitle", "tags", "isActive"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const [updated] = await db
      .update(contacts)
      .set(updateData)
      .where(eq(contacts.id, id))
      .returning();

    return NextResponse.json({ contact: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// DELETE - Delete a contact
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), eq(contacts.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    await db.delete(contacts).where(eq(contacts.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
