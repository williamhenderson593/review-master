import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles, subscriptionPlans, user, clients, clientSubscriptions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const defaultRoles = [
  {
    name: "super_admin",
    description: "Platform super administrator with access to all businesses and users",
    permissions: ["all", "super_admin"],
  },
  {
    name: "business_admin",
    description: "Business administrator with full access to the organization",
    permissions: ["all"],
  },
  {
    name: "member",
    description: "Team member with limited access",
    permissions: ["read", "write"],
  },
  {
    name: "viewer",
    description: "Read-only access to the organization",
    permissions: ["read"],
  },
];

const defaultPlans = [
  {
    name: "Basic",
    description: "Perfect for small teams getting started",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Up to 3 team members",
      "1 API key",
      "Basic analytics",
      "Email support",
      "5GB storage",
    ],
    maxMembers: 3,
    maxApiKeys: 1,
    sortOrder: 0,
  },
  {
    name: "Professional",
    description: "For growing businesses that need more power",
    priceMonthly: 2900,
    priceYearly: 29000,
    features: [
      "Up to 10 team members",
      "5 API keys",
      "Advanced analytics",
      "Priority email support",
      "50GB storage",
      "Custom integrations",
      "API access",
    ],
    maxMembers: 10,
    maxApiKeys: 5,
    sortOrder: 1,
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    priceMonthly: 9900,
    priceYearly: 99000,
    features: [
      "Unlimited team members",
      "Unlimited API keys",
      "Enterprise analytics",
      "24/7 phone & email support",
      "Unlimited storage",
      "Custom integrations",
      "Full API access",
      "SSO/SAML",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    maxMembers: 999,
    maxApiKeys: 100,
    sortOrder: 2,
  },
];

export async function POST() {
  try {
    // Seed roles
    for (const role of defaultRoles) {
      const existing = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
      if (existing.length === 0) {
        await db.insert(roles).values(role);
      }
    }

    // Seed subscription plans
    for (const plan of defaultPlans) {
      const existing = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.name, plan.name))
        .limit(1);
      if (existing.length === 0) {
        await db.insert(subscriptionPlans).values(plan);
      }
    }

    // Seed super admin user
    const superAdminEmail = "admin@telaven.com";
    const superAdminPassword = "Admin@12345";
    const existingAdmin = await db.select().from(user).where(eq(user.email, superAdminEmail)).limit(1);

    if (existingAdmin.length === 0) {
      // Create a business for the super admin
      const adminClient = await db
        .insert(clients)
        .values({
          name: "Telaven",
          slug: "telaven",
          email: superAdminEmail,
        })
        .returning();

      const superAdminRole = await db.select().from(roles).where(eq(roles.name, "super_admin")).limit(1);

      // Create user via Better Auth
      await auth.api.signUpEmail({
        body: {
          name: "Super Admin",
          email: superAdminEmail,
          password: superAdminPassword,
          clientId: adminClient[0].id,
          roleId: superAdminRole[0]?.id || undefined,
        },
        headers: await headers(),
      });

      // Mark email as verified so the super admin can log in immediately
      await db
        .update(user)
        .set({ emailVerified: true })
        .where(eq(user.email, superAdminEmail));

      // Assign basic plan
      const basicPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, "Basic")).limit(1);
      if (basicPlan.length > 0) {
        await db.insert(clientSubscriptions).values({
          clientId: adminClient[0].id,
          planId: basicPlan[0].id,
          status: "active",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed data created successfully",
      superAdmin: {
        email: superAdminEmail,
        password: superAdminPassword,
        note: "Change this password after first login!",
      },
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
