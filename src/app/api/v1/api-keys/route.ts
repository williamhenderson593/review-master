import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientApiKeys } from "@/lib/schema";
import { requireBusinessAdmin } from "@/lib/auth-utils";
import { eq, desc } from "drizzle-orm";
import { encrypt, hashApiKey, generateApiKey } from "@/lib/encryption";

// GET - List all API keys for the current user's client
export async function GET() {
  try {
    const currentUser = await requireBusinessAdmin();

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const keys = await db
      .select({
        id: clientApiKeys.id,
        name: clientApiKeys.name,
        keyPrefix: clientApiKeys.keyPrefix,
        isActive: clientApiKeys.isActive,
        lastUsedAt: clientApiKeys.lastUsedAt,
        expiresAt: clientApiKeys.expiresAt,
        createdAt: clientApiKeys.createdAt,
      })
      .from(clientApiKeys)
      .where(eq(clientApiKeys.clientId, currentUser.clientId))
      .orderBy(desc(clientApiKeys.createdAt));

    return NextResponse.json({ keys });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch API keys" }, { status: 500 });
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireBusinessAdmin();

    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No business associated" }, { status: 400 });
    }

    const body = await request.json();
    const { name, expiresInDays } = body;

    if (!name) {
      return NextResponse.json({ error: "API key name is required" }, { status: 400 });
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);
    const encryptedKey = encrypt(rawKey);
    const keyPrefix = rawKey.substring(0, 10) + "...";

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const newKey = await db
      .insert(clientApiKeys)
      .values({
        clientId: currentUser.clientId,
        name,
        keyHash,
        keyPrefix,
        encryptedKey,
        expiresAt,
        createdBy: currentUser.id,
      })
      .returning();

    return NextResponse.json({
      success: true,
      key: {
        id: newKey[0].id,
        name: newKey[0].name,
        keyPrefix: newKey[0].keyPrefix,
        rawKey, // Only returned on creation
        createdAt: newKey[0].createdAt,
      },
      message: "API key created. Copy it now — you won't be able to see it again.",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message?.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
