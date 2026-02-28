import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { isSMSConfigured, getATBalance } from "@/lib/sms";

// GET - Check SMS configuration status and balance
export async function GET() {
  try {
    await requireAuth();

    const configured = isSMSConfigured();

    if (!configured) {
      return NextResponse.json({
        configured: false,
        senderId: null,
        balance: null,
        message: "Africa's Talking SMS is not configured. Contact your administrator.",
      });
    }

    const { balance, error } = await getATBalance();

    return NextResponse.json({
      configured: true,
      senderId: process.env.AT_SENDER_ID || "ReviewFlow",
      username: process.env.AT_USERNAME,
      isSandbox: process.env.AT_USERNAME === "sandbox" || process.env.AT_SANDBOX === "true",
      balance,
      balanceError: error,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to check SMS status" }, { status: 500 });
  }
}
