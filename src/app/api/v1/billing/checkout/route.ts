import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

// Polar.sh product IDs — set these in your environment after creating products in Polar
const POLAR_PRODUCT_IDS: Record<string, string> = {
  lite: process.env.POLAR_PRODUCT_LITE || "",
  pro: process.env.POLAR_PRODUCT_PRO || "",
  premium: process.env.POLAR_PRODUCT_PREMIUM || "",
}

// POST - Create a Polar.sh checkout session
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { planId, profileCount = 3 } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId is required" }, { status: 400 });
    }

    const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
    const polarOrgId = process.env.POLAR_ORGANIZATION_ID;
    const productId = POLAR_PRODUCT_IDS[planId];

    // If Polar is not configured, return a demo response
    if (!polarAccessToken || !polarOrgId || !productId) {
      return NextResponse.json({
        message: "Polar.sh not configured. Set POLAR_ACCESS_TOKEN, POLAR_ORGANIZATION_ID, and POLAR_PRODUCT_* environment variables.",
        configured: false,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3003";

    // Create Polar.sh checkout session
    const response = await fetch("https://api.polar.sh/v1/checkouts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        success_url: `${appUrl}/settings/billing?success=true&plan=${planId}`,
        customer_email: currentUser.email,
        metadata: {
          clientId: currentUser.clientId,
          userId: currentUser.id,
          planId,
          profileCount: String(profileCount),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Polar checkout error:", error);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }

    const checkout = await response.json();

    return NextResponse.json({
      checkoutUrl: checkout.url,
      checkoutId: checkout.id,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Billing checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
