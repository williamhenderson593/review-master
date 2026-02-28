import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contacts } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, desc, ilike, or } from "drizzle-orm";

// GET - List all contacts
export async function GET(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = db
      .select()
      .from(contacts)
      .where(eq(contacts.clientId, currentUser.clientId))
      .orderBy(desc(contacts.createdAt))
      .limit(limit)
      .offset(offset);

    const allContacts = await query;

    return NextResponse.json({ contacts: allContacts, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone, company, jobTitle, tags } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const [contact] = await db
      .insert(contacts)
      .values({
        clientId: currentUser.clientId,
        firstName,
        lastName,
        email,
        phone,
        company,
        jobTitle,
        tags: tags || [],
        source: "manual",
      })
      .returning();

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
