import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// GET - Get a single review
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }
    const { id } = await params;

    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.clientId, currentUser.clientId)));

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch review" }, { status: 500 });
  }
}

// PUT - Update a review (reply, tag, flag, etc.)
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
      .from(reviews)
      .where(and(eq(reviews.id, id), eq(reviews.clientId, currentUser.clientId)));

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = [
      "replyText", "repliedAt", "tags", "topics", "needsAction", "actionNote",
      "isFlagged", "flagReason", "sentiment", "translatedBody"
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    // If replying, set repliedAt and repliedBy
    if (body.replyText && !existing.repliedAt) {
      updateData.repliedAt = new Date();
      updateData.repliedBy = currentUser.id;
      updateData.needsAction = false;
    }

    const [updated] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, id))
      .returning();

    return NextResponse.json({ review: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
