import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { memberInvites, clients, roles, user } from "@/lib/schema";
import { requireBusinessAdmin } from "@/lib/auth-utils";
import { eq, and, desc } from "drizzle-orm";
import { sendEmail, inviteEmail } from "@/lib/email";
import crypto from "crypto";

// GET - List all invites for the current user's client
export async function GET() {
  try {
    const currentUser = await requireBusinessAdmin();

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const invites = await db
      .select({
        id: memberInvites.id,
        email: memberInvites.email,
        status: memberInvites.status,
        expiresAt: memberInvites.expiresAt,
        acceptedAt: memberInvites.acceptedAt,
        createdAt: memberInvites.createdAt,
        invitedByName: user.name,
        roleName: roles.name,
      })
      .from(memberInvites)
      .leftJoin(user, eq(memberInvites.invitedBy, user.id))
      .leftJoin(roles, eq(memberInvites.roleId, roles.id))
      .where(eq(memberInvites.clientId, currentUser.clientId))
      .orderBy(desc(memberInvites.createdAt));

    // Auto-expire invites
    const now = new Date();
    const updatedInvites = invites.map((inv) => {
      if (inv.status === "pending" && new Date(inv.expiresAt) < now) {
        return { ...inv, status: "expired" };
      }
      return inv;
    });

    return NextResponse.json({ invites: updatedInvites });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error fetching invites:", error);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

// POST - Send a new invite
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireBusinessAdmin();

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists in the same client
    const existingUser = await db
      .select()
      .from(user)
      .where(and(eq(user.email, email), eq(user.clientId, currentUser.clientId)))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "This user is already a member of your business" }, { status: 409 });
    }

    // Check for pending invite
    const existingInvite = await db
      .select()
      .from(memberInvites)
      .where(
        and(
          eq(memberInvites.email, email),
          eq(memberInvites.clientId, currentUser.clientId),
          eq(memberInvites.status, "pending")
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      return NextResponse.json({ error: "An invite is already pending for this email" }, { status: 409 });
    }

    // Get member role
    const memberRole = await db.select().from(roles).where(eq(roles.name, "member")).limit(1);

    // Generate invite token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create invite
    const invite = await db
      .insert(memberInvites)
      .values({
        clientId: currentUser.clientId,
        email,
        roleId: memberRole.length > 0 ? memberRole[0].id : null,
        token,
        status: "pending",
        invitedBy: currentUser.id,
        expiresAt,
      })
      .returning();

    // Build invite URL (points to app subdomain)
    const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "http";
    const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost:3003";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://app.${domain}`;
    const clientName = currentUser.client?.name || "your business";
    const inviteUrl = `${appUrl}/sign-up?invite=${token}&email=${encodeURIComponent(email)}&business=${encodeURIComponent(clientName)}`;

    // Send invite email
    await sendEmail({
      to: email,
      subject: `You've been invited to join ${clientName} on Telaven`,
      html: inviteEmail(currentUser.name, clientName, inviteUrl),
    });

    return NextResponse.json({
      success: true,
      invite: invite[0],
      message: `Invitation sent to ${email}`,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating invite:", error);
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }
}
