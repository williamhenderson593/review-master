import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { sendSMS, sendBulkSMS, isSMSConfigured } from "@/lib/sms";
import { db } from "@/lib/db";
import { contacts, campaignRequests, campaigns } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";

// POST - Send SMS review request(s)
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { type, phone, message, campaignId, contactIds } = body;

    if (!isSMSConfigured()) {
      return NextResponse.json({
        error: "SMS not configured",
        message: "Africa's Talking SMS is not configured. Please contact your administrator to set up SMS.",
        configured: false,
      }, { status: 503 });
    }

    // Single SMS
    if (type === "single") {
      if (!phone || !message) {
        return NextResponse.json({ error: "phone and message are required" }, { status: 400 });
      }

      const result = await sendSMS(phone, message);

      return NextResponse.json({
        success: result.success,
        messageId: result.messageId,
        cost: result.cost,
        error: result.error,
      });
    }

    // Bulk SMS for a campaign
    if (type === "campaign") {
      if (!campaignId) {
        return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
      }

      // Get campaign
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.id, campaignId), eq(campaigns.clientId, currentUser.clientId)));

      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
      }

      // Get contacts to send to
      let targetContacts: Array<{ id: string; phone: string | null; firstName: string | null; lastName: string | null }> = [];

      if (contactIds && contactIds.length > 0) {
        targetContacts = await db
          .select({ id: contacts.id, phone: contacts.phone, firstName: contacts.firstName, lastName: contacts.lastName })
          .from(contacts)
          .where(and(
            eq(contacts.clientId, currentUser.clientId),
            inArray(contacts.id, contactIds)
          ));
      } else {
        // Get all contacts with phone numbers
        targetContacts = await db
          .select({ id: contacts.id, phone: contacts.phone, firstName: contacts.firstName, lastName: contacts.lastName })
          .from(contacts)
          .where(and(eq(contacts.clientId, currentUser.clientId)));
      }

      const phoneContacts = targetContacts.filter(c => c.phone);

      if (phoneContacts.length === 0) {
        return NextResponse.json({ error: "No contacts with phone numbers found" }, { status: 400 });
      }

      const messageTemplate = campaign.messageTemplate ||
        `Hi {{name}}, we'd love your feedback! Please leave us a review: ${campaign.magicLinkUrl}`;

      const recipients = phoneContacts.map(c => ({
        phone: c.phone!,
        message: messageTemplate
          .replace("{{name}}", [c.firstName, c.lastName].filter(Boolean).join(" ") || "there")
          .replace("{{review_link}}", campaign.magicLinkUrl || ""),
      }));

      const result = await sendBulkSMS(recipients, messageTemplate);

      // Create campaign request records
      for (const r of result.results) {
        const contact = phoneContacts.find(c => c.phone === r.phone);
        if (contact && r.success) {
          await db.insert(campaignRequests).values({
            campaignId,
            contactId: contact.id,
            clientId: currentUser.clientId,
            recipientPhone: r.phone,
            status: "sent",
            sentAt: new Date(),
          }).onConflictDoNothing();
        }
      }

      // Update campaign totals
      await db
        .update(campaigns)
        .set({
          totalSent: campaign.totalSent + result.sent,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId));

      return NextResponse.json({
        success: true,
        sent: result.sent,
        failed: result.failed,
        total: recipients.length,
        results: result.results,
      });
    }

    return NextResponse.json({ error: "Invalid type. Use 'single' or 'campaign'" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("SMS send error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
