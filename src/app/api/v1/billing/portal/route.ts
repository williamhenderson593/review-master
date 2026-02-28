import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

// POST - Create a Polar.sh customer portal session
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;

    if (!polarAccessToken) {
      return NextResponse.json({
        message: "Polar.sh not configured. Set POLAR_ACCESS_TOKEN to enable billing portal.",
        configured: false,
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://app.localhost:3003";

    // Create Polar.sh customer portal session
    const response = await fetch("https://api.polar.sh/v1/customer-portal/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${polarAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_email: currentUser.email,
        return_url: `${appUrl}/settings/billing`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Polar portal error:", error);
      return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
    }

    const portal = await response.json();

    return NextResponse.json({ url: portal.url });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Billing portal error:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
