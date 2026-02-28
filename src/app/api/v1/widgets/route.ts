import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { widgets } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";

// GET - List all widgets
export async function GET() {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const allWidgets = await db
      .select()
      .from(widgets)
      .where(eq(widgets.clientId, currentUser.clientId))
      .orderBy(desc(widgets.createdAt));

    return NextResponse.json({ widgets: allWidgets });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch widgets" }, { status: 500 });
  }
}

// POST - Create a new widget
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { name, type, config } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 });
    }

    const [widget] = await db
      .insert(widgets)
      .values({
        clientId: currentUser.clientId,
        name,
        type,
        config,
        isActive: true,
        createdBy: currentUser.id,
      })
      .returning();

    // Generate embed code after creation
    const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://app.reviewflow.com"}/widget.js" data-widget-id="${widget.id}" async></script>`;

    const [updated] = await db
      .update(widgets)
      .set({ embedCode })
      .where(eq(widgets.id, widget.id))
      .returning();

    return NextResponse.json({ widget: updated }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create widget" }, { status: 500 });
  }
}
