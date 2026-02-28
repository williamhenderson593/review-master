import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { user, clients, roles } from "@/lib/schema";
import { requireSuperAdmin } from "@/lib/auth-utils";
import { count, like, or, sql } from "drizzle-orm";
import { eq } from "drizzle-orm";

// GET - List all users across all businesses (super admin only)
export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        country: user.country,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        roleName: roles.name,
        roleId: roles.id,
        clientId: clients.id,
        clientName: clients.name,
      })
      .from(user)
      .leftJoin(roles, eq(user.roleId, roles.id))
      .leftJoin(clients, eq(user.clientId, clients.id))
      .orderBy(user.createdAt)
      .limit(limit)
      .offset(offset);

    if (search) {
      query = query.where(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      ) as typeof query;
    }

    const users = await query;

    // Get total count
    let countQuery = db.select({ total: count() }).from(user);
    if (search) {
      countQuery = countQuery.where(
        or(
          like(user.name, `%${search}%`),
          like(user.email, `%${search}%`)
        )
      ) as typeof countQuery;
    }
    const totalResult = await countQuery;
    const total = totalResult[0]?.total || 0;

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message.startsWith("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
