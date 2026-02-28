import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// GET - Get a single review profile
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [profile] = await db
      .select()
      .from(reviewProfiles)
      .where(and(eq(reviewProfiles.id, id), eq(reviewProfiles.clientId, currentUser.clientId)));

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch review profile" }, { status: 500 });
  }
}

// PUT - Update a review profile
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
      .from(reviewProfiles)
      .where(and(eq(reviewProfiles.id, id), eq(reviewProfiles.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = ["name", "platform", "platformProfileId", "profileUrl", "logoUrl", "isActive", "isCompetitor"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const [updated] = await db
      .update(reviewProfiles)
      .set(updateData)
      .where(eq(reviewProfiles.id, id))
      .returning();

    return NextResponse.json({ profile: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update review profile" }, { status: 500 });
  }
}

// DELETE - Delete a review profile
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [existing] = await db
      .select()
      .from(reviewProfiles)
      .where(and(eq(reviewProfiles.id, id), eq(reviewProfiles.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db.delete(reviewProfiles).where(eq(reviewProfiles.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete review profile" }, { status: 500 });
  }
}
