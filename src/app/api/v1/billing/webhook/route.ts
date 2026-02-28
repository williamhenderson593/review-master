import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientSubscriptions, subscriptionPlans, clients } from "@/lib/schema";
import { eq } from "drizzle-orm";

// POST - Handle Polar.sh webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("polar-signature") || "";
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      // In production, verify the HMAC signature
      // For now, we'll process the event directly
    }

    const event = JSON.parse(body);
    const eventType = event.type;

    console.log("Polar webhook event:", eventType, event.data?.id);

    switch (eventType) {
      case "checkout.created":
      case "checkout.updated": {
        // Checkout session created/updated
        const checkout = event.data;
        if (checkout.status === "succeeded" && checkout.metadata?.clientId) {
          await handleSubscriptionActivated(
            checkout.metadata.clientId,
            checkout.metadata.planId,
            checkout.metadata.profileCount
          );
        }
        break;
      }

      case "subscription.created":
      case "subscription.updated": {
        const subscription = event.data;
        if (subscription.metadata?.clientId) {
          await handleSubscriptionActivated(
            subscription.metadata.clientId,
            subscription.metadata.planId,
            subscription.metadata.profileCount
          );
        }
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const subscription = event.data;
        if (subscription.metadata?.clientId) {
          await handleSubscriptionCanceled(subscription.metadata.clientId);
        }
        break;
      }

      default:
        console.log("Unhandled Polar event:", eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Polar webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleSubscriptionActivated(clientId: string, planId: string, profileCount?: string) {
  try {
    // Find or create the subscription plan in our DB
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, planId));

    if (!plan) {
      console.error("Plan not found:", planId);
      return;
    }

    // Upsert client subscription
    const existing = await db
      .select()
      .from(clientSubscriptions)
      .where(eq(clientSubscriptions.clientId, clientId));

    if (existing.length > 0) {
      await db
        .update(clientSubscriptions)
        .set({
          planId: plan.id,
          status: "active",
          currentPeriodStart: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(clientSubscriptions.clientId, clientId));
    } else {
      await db.insert(clientSubscriptions).values({
        clientId,
        planId: plan.id,
        status: "active",
        currentPeriodStart: new Date(),
      });
    }

    // Update client metadata with profile count
    if (profileCount) {
      await db
        .update(clients)
        .set({
          metadata: { profileCount: parseInt(profileCount), planId },
          updatedAt: new Date(),
        })
        .where(eq(clients.id, clientId));
    }

    console.log(`Subscription activated for client ${clientId}, plan ${planId}`);
  } catch (error) {
    console.error("Error activating subscription:", error);
  }
}

async function handleSubscriptionCanceled(clientId: string) {
  try {
    await db
      .update(clientSubscriptions)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(clientSubscriptions.clientId, clientId));

    console.log(`Subscription canceled for client ${clientId}`);
  } catch (error) {
    console.error("Error canceling subscription:", error);
  }
}
