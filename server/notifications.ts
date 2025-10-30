import axios from "axios";
import { getUserById } from "./db";

/**
 * Send email notification
 */
export async function sendEmailNotification(
  userId: number,
  message: string,
  severity: "low" | "medium" | "high" | "critical"
) {
  try {
    const user = await getUserById(userId);
    if (!user || !user.email) {
      console.warn(`[Notifications] User ${userId} has no email address`);
      return;
    }

    // In production, use a service like SendGrid, AWS SES, or Mailgun
    // For now, we'll log the notification
    console.log(
      `[Notifications] Email sent to ${user.email}: [${severity.toUpperCase()}] ${message}`
    );

    // Example: Using a hypothetical email service
    // await emailService.send({
    //   to: user.email,
    //   subject: `[${severity.toUpperCase()}] Uptime Alert`,
    //   body: message,
    // });
  } catch (error) {
    console.error("[Notifications] Failed to send email:", error);
  }
}

/**
 * Send Slack notification
 */
export async function sendSlackNotification(
  webhookUrl: string,
  message: string,
  severity: "low" | "medium" | "high" | "critical"
) {
  try {
    const colorMap = {
      low: "#36a64f",
      medium: "#ffa500",
      high: "#ff6b6b",
      critical: "#8b0000",
    };

    const payload = {
      attachments: [
        {
          color: colorMap[severity],
          title: `Uptime Alert - ${severity.toUpperCase()}`,
          text: message,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    await axios.post(webhookUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[Notifications] Slack notification sent");
  } catch (error) {
    console.error("[Notifications] Failed to send Slack notification:", error);
  }
}

/**
 * Send Discord notification
 */
export async function sendDiscordNotification(
  webhookUrl: string,
  message: string,
  severity: "low" | "medium" | "high" | "critical"
) {
  try {
    const colorMap = {
      low: 3581519, // Green
      medium: 16776960, // Yellow
      high: 16711680, // Red
      critical: 8388608, // Dark Red
    };

    const payload = {
      embeds: [
        {
          title: `Uptime Alert - ${severity.toUpperCase()}`,
          description: message,
          color: colorMap[severity],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    await axios.post(webhookUrl, payload, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("[Notifications] Discord notification sent");
  } catch (error) {
    console.error("[Notifications] Failed to send Discord notification:", error);
  }
}

/**
 * Send SMS notification (placeholder for future implementation)
 */
export async function sendSMSNotification(
  phoneNumber: string,
  message: string
) {
  try {
    // In production, use a service like Twilio
    console.log(
      `[Notifications] SMS sent to ${phoneNumber}: ${message}`
    );
  } catch (error) {
    console.error("[Notifications] Failed to send SMS:", error);
  }
}

/**
 * Send webhook notification
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  data: Record<string, any>
) {
  try {
    await axios.post(webhookUrl, data, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("[Notifications] Webhook notification sent");
  } catch (error) {
    console.error("[Notifications] Failed to send webhook notification:", error);
  }
}
