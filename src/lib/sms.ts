/**
 * Africa's Talking SMS Integration
 * 
 * Platform-level SMS service — configured by super admin.
 * All businesses share the same sender ID configured in admin settings.
 * 
 * Environment variables (set by super admin):
 *   AT_API_KEY     - Africa's Talking API key
 *   AT_USERNAME    - Africa's Talking username (use 'sandbox' for testing)
 *   AT_SENDER_ID   - Sender ID (e.g., 'ReviewFlow' or a shortcode)
 */

const AT_BASE_URL = "https://api.africastalking.com/version1";
const AT_SANDBOX_URL = "https://api.sandbox.africastalking.com/version1";

export interface SMSResult {
  success: boolean
  messageId?: string
  cost?: string
  statusCode?: string
  error?: string
}

export interface SMSBulkResult {
  sent: number
  failed: number
  results: Array<{
    phone: string
    success: boolean
    messageId?: string
    error?: string
  }>
}

function getConfig() {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;
  const senderId = process.env.AT_SENDER_ID || "ReviewFlow";
  const isSandbox = username === "sandbox" || process.env.AT_SANDBOX === "true";

  return { apiKey, username, senderId, isSandbox };
}

/**
 * Send a single SMS via Africa's Talking
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  const { apiKey, username, senderId, isSandbox } = getConfig();

  if (!apiKey || !username) {
    console.warn("Africa's Talking not configured. Set AT_API_KEY and AT_USERNAME.");
    return {
      success: false,
      error: "SMS not configured. Contact your administrator.",
    };
  }

  const baseUrl = isSandbox ? AT_SANDBOX_URL : AT_BASE_URL;

  try {
    const params = new URLSearchParams({
      username,
      to,
      message,
      ...(senderId ? { from: senderId } : {}),
    });

    const response = await fetch(`${baseUrl}/messaging`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        "apiKey": apiKey,
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Africa's Talking SMS error:", errorText);
      return { success: false, error: `SMS API error: ${response.status}` };
    }

    const data = await response.json();
    const recipient = data.SMSMessageData?.Recipients?.[0];

    if (!recipient) {
      return { success: false, error: "No recipient data in response" };
    }

    const isSuccess = recipient.statusCode === "101" || recipient.status === "Success";

    return {
      success: isSuccess,
      messageId: recipient.messageId,
      cost: recipient.cost,
      statusCode: recipient.statusCode,
      error: isSuccess ? undefined : recipient.status,
    };
  } catch (error: any) {
    console.error("SMS send error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(
  recipients: Array<{ phone: string; message?: string }>,
  defaultMessage: string
): Promise<SMSBulkResult> {
  const results: SMSBulkResult["results"] = [];
  let sent = 0;
  let failed = 0;

  // Africa's Talking supports bulk sending — send all at once
  const { apiKey, username, senderId, isSandbox } = getConfig();

  if (!apiKey || !username) {
    return {
      sent: 0,
      failed: recipients.length,
      results: recipients.map(r => ({
        phone: r.phone,
        success: false,
        error: "SMS not configured",
      })),
    };
  }

  const baseUrl = isSandbox ? AT_SANDBOX_URL : AT_BASE_URL;

  // Group by message to minimize API calls
  const messageGroups = new Map<string, string[]>();
  for (const r of recipients) {
    const msg = r.message || defaultMessage;
    if (!messageGroups.has(msg)) messageGroups.set(msg, []);
    messageGroups.get(msg)!.push(r.phone);
  }

  for (const [message, phones] of messageGroups) {
    try {
      const params = new URLSearchParams({
        username,
        to: phones.join(","),
        message,
        ...(senderId ? { from: senderId } : {}),
      });

      const response = await fetch(`${baseUrl}/messaging`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
          "apiKey": apiKey,
        },
        body: params.toString(),
      });

      if (!response.ok) {
        for (const phone of phones) {
          results.push({ phone, success: false, error: `API error: ${response.status}` });
          failed++;
        }
        continue;
      }

      const data = await response.json();
      const recipients_data = data.SMSMessageData?.Recipients || [];

      for (const recipient of recipients_data) {
        const isSuccess = recipient.statusCode === "101" || recipient.status === "Success";
        results.push({
          phone: recipient.number,
          success: isSuccess,
          messageId: recipient.messageId,
          error: isSuccess ? undefined : recipient.status,
        });
        if (isSuccess) sent++;
        else failed++;
      }
    } catch (error: any) {
      for (const phone of phones) {
        results.push({ phone, success: false, error: error.message });
        failed++;
      }
    }
  }

  return { sent, failed, results };
}

/**
 * Check Africa's Talking account balance
 */
export async function getATBalance(): Promise<{ balance: string; error?: string }> {
  const { apiKey, username, isSandbox } = getConfig();

  if (!apiKey || !username) {
    return { balance: "N/A", error: "Not configured" };
  }

  const baseUrl = isSandbox ? AT_SANDBOX_URL : AT_BASE_URL;

  try {
    const response = await fetch(`${baseUrl}/user?username=${username}`, {
      headers: {
        "Accept": "application/json",
        "apiKey": apiKey,
      },
    });

    if (!response.ok) {
      return { balance: "N/A", error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { balance: data.UserData?.balance || "N/A" };
  } catch (error: any) {
    return { balance: "N/A", error: error.message };
  }
}

/**
 * Check if SMS is configured
 */
export function isSMSConfigured(): boolean {
  return !!(process.env.AT_API_KEY && process.env.AT_USERNAME);
}
