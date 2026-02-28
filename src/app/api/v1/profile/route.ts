import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq } from "drizzle-orm";

// GET - Get current user profile
export async function GET() {
  try {
    const currentUser = await requireAuth();
    return NextResponse.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        country: currentUser.country,
        image: currentUser.image,
        emailVerified: currentUser.emailVerified,
        role: currentUser.role,
        client: currentUser.client,
        createdAt: currentUser.createdAt,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    const body = await request.json();
    const { name, phone, country } = body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;

    await db.update(user).set(updateData).where(eq(user.id, currentUser.id));

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
