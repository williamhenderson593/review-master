import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientApiKeys } from "@/lib/schema";
import { requireBusinessAdmin } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// DELETE - Revoke/delete an API key
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireBusinessAdmin();
    const { id } = await params;

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const key = await db
      .select()
      .from(clientApiKeys)
      .where(
        and(
          eq(clientApiKeys.id, id),
          eq(clientApiKeys.clientId, currentUser.clientId)
        )
      )
      .limit(1);

    if (!key.length) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await db.delete(clientApiKeys).where(eq(clientApiKeys.id, id));

    return NextResponse.json({ success: true, message: "API key deleted" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 });
  }
}

// PATCH - Toggle API key active status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireBusinessAdmin();
    const { id } = await params;

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const key = await db
      .select()
      .from(clientApiKeys)
      .where(
        and(
          eq(clientApiKeys.id, id),
          eq(clientApiKeys.clientId, currentUser.clientId)
        )
      )
      .limit(1);

    if (!key.length) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await db
      .update(clientApiKeys)
      .set({ isActive: !key[0].isActive, updatedAt: new Date() })
      .where(eq(clientApiKeys.id, id));

    return NextResponse.json({
      success: true,
      message: key[0].isActive ? "API key deactivated" : "API key activated",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 });
  }
}
