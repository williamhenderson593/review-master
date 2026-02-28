import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memberInvites } from "@/lib/schema";
import { requireBusinessAdmin } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// DELETE - Revoke an invite
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

    const invite = await db
      .select()
      .from(memberInvites)
      .where(
        and(
          eq(memberInvites.id, id),
          eq(memberInvites.clientId, currentUser.clientId)
        )
      )
      .limit(1);

    if (!invite.length) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite[0].status !== "pending") {
      return NextResponse.json({ error: "Only pending invites can be revoked" }, { status: 400 });
    }

    await db
      .update(memberInvites)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(memberInvites.id, id));

    return NextResponse.json({ success: true, message: "Invite revoked" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error revoking invite:", error);
    return NextResponse.json({ error: "Failed to revoke invite" }, { status: 500 });
  }
}
