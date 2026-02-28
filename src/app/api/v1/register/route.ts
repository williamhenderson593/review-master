import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clients, roles, user, memberInvites, clientSubscriptions, subscriptionPlans } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { sendEmail, welcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, businessName, phone, country, inviteToken } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    let clientId: string | null = null;
    let roleId: string | null = null;
    let roleName = "business_admin";

    // Handle invite flow
    if (inviteToken) {
      const invite = await db
        .select()
        .from(memberInvites)
        .where(
          and(
            eq(memberInvites.token, inviteToken),
            eq(memberInvites.status, "pending")
          )
        )
        .limit(1);

      if (!invite.length) {
        return NextResponse.json({ error: "Invalid or expired invite link" }, { status: 400 });
      }

      const inv = invite[0];

      if (new Date(inv.expiresAt) < new Date()) {
        await db
          .update(memberInvites)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(memberInvites.id, inv.id));
        return NextResponse.json({ error: "This invite link has expired" }, { status: 400 });
      }

      if (inv.email !== email) {
        return NextResponse.json({ error: "This invite was sent to a different email address" }, { status: 400 });
      }

      clientId = inv.clientId;
      roleName = "member";

      // Get member role
      const memberRole = await db.select().from(roles).where(eq(roles.name, "member")).limit(1);
      if (memberRole.length > 0) {
        roleId = memberRole[0].id;
      }

      // Mark invite as accepted
      await db
        .update(memberInvites)
        .set({ status: "accepted", acceptedAt: new Date(), updatedAt: new Date() })
        .where(eq(memberInvites.id, inv.id));
    } else {
      // Regular signup - create client (business)
      if (!businessName) {
        return NextResponse.json({ error: "Business name is required" }, { status: 400 });
      }

      const slug = businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const newClient = await db
        .insert(clients)
        .values({
          name: businessName,
          slug: `${slug}-${Date.now()}`,
          email,
          phone: phone || null,
          country: country || null,
        })
        .returning();

      clientId = newClient[0].id;

      // Get or create business_admin role
      const adminRole = await db.select().from(roles).where(eq(roles.name, "business_admin")).limit(1);
      if (adminRole.length > 0) {
        roleId = adminRole[0].id;
      }

      // Assign default subscription (basic plan)
      const basicPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, "Basic")).limit(1);
      if (basicPlan.length > 0 && clientId) {
        await db.insert(clientSubscriptions).values({
          clientId,
          planId: basicPlan[0].id,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Sign up via Better Auth
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        phone: phone || undefined,
        country: country || undefined,
        clientId: clientId || undefined,
        roleId: roleId || undefined,
      },
      headers: await headers(),
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    const displayBusinessName = inviteToken
      ? (await db.select().from(clients).where(eq(clients.id, clientId!)).limit(1))?.[0]?.name || "your team"
      : businessName;

    sendEmail({
      to: email,
      subject: `Welcome to Telaven, ${name.split(" ")[0]}!`,
      html: welcomeEmail(name.split(" ")[0], displayBusinessName),
    }).catch((err) => console.error("Failed to send welcome email:", err));

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please check your email to verify your account.",
      user: signUpResult?.user
        ? { id: signUpResult.user.id, email: signUpResult.user.email, name: signUpResult.user.name }
        : null,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    const message = error?.message || "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
