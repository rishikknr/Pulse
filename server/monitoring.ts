import axios from "axios";
import {
  getAllActiveTargets,
  createMonitoringCheck,
  getAlertRulesByTarget,
  getMonitoringChecks,
  createAlert,
  getNotificationSettings,
} from "./db";
import { sendEmailNotification, sendSlackNotification, sendDiscordNotification } from "./notifications";

interface CheckResult {
  targetId: number;
  statusCode?: number;
  responseTime: number;
  isSuccess: boolean;
  errorMessage?: string;
}

/**
 * Perform a single health check on a monitoring target
 */
export async function performHealthCheck(target: any): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const url = `${target.protocol}://${target.url}`;
    
    const response = await axios({
      method: target.method || "GET",
      url,
      timeout: (target.timeout || 10) * 1000,
      validateStatus: () => true, // Don't throw on any status code
    });

    const responseTime = Date.now() - startTime;
    const isSuccess = response.status === target.expectedStatusCode;

    return {
      targetId: target.id,
      statusCode: response.status,
      responseTime,
      isSuccess,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    const errorMessage = error.message || "Unknown error";

    return {
      targetId: target.id,
      responseTime,
      isSuccess: false,
      errorMessage,
    };
  }
}

/**
 * Check for consecutive failures and trigger alerts
 */
export async function checkAndTriggerAlerts(
  targetId: number,
  userId: number,
  isCurrentCheckSuccess: boolean
) {
  const alertRules = await getAlertRulesByTarget(targetId, userId);
  
  for (const rule of alertRules) {
    if (!rule.isActive) continue;

    if (rule.ruleType === "consecutive_failures") {
      const recentChecks = await getMonitoringChecks(targetId, rule.threshold || 3);
      
      // Check if last N checks are all failures
      if (recentChecks.length >= (rule.threshold || 3)) {
        const lastNChecks = recentChecks.slice(0, rule.threshold || 3);
        const allFailed = lastNChecks.every((check) => !check.isSuccess);

        if (allFailed && !isCurrentCheckSuccess) {
          await triggerAlert(
            rule.id,
            targetId,
            userId,
            `${rule.threshold} consecutive failures detected`,
            "high",
            rule.notificationChannels
          );
        }
      }
    }
  }
}

/**
 * Trigger an alert and send notifications
 */
export async function triggerAlert(
  ruleId: number,
  targetId: number,
  userId: number,
  message: string,
  severity: "low" | "medium" | "high" | "critical",
  notificationChannels: string
) {
  try {
    // Create alert record
    await createAlert({
      ruleId,
      targetId,
      userId,
      message,
      severity,
      status: "triggered",
    });

    // Send notifications
    const channels = JSON.parse(notificationChannels);
    const notificationSettings = await getNotificationSettings(userId);

    if (channels.includes("email") && notificationSettings?.emailEnabled) {
      await sendEmailNotification(userId, message, severity);
    }

    if (channels.includes("slack") && notificationSettings?.slackWebhookUrl) {
      await sendSlackNotification(
        notificationSettings.slackWebhookUrl,
        message,
        severity
      );
    }

    if (channels.includes("discord") && notificationSettings?.discordWebhookUrl) {
      await sendDiscordNotification(
        notificationSettings.discordWebhookUrl,
        message,
        severity
      );
    }
  } catch (error) {
    console.error("[Alert] Failed to trigger alert:", error);
  }
}

/**
 * Calculate uptime percentage for a target
 */
export async function calculateUptimePercentage(
  targetId: number,
  checks: any[]
): Promise<number> {
  if (checks.length === 0) return 100;

  const successfulChecks = checks.filter((check) => check.isSuccess).length;
  return (successfulChecks / checks.length) * 100;
}

/**
 * Main monitoring loop - runs periodically
 */
export async function runMonitoringCycle() {
  console.log("[Monitoring] Starting monitoring cycle...");

  try {
    const targets = await getAllActiveTargets();

    for (const target of targets) {
      try {
        // Perform health check
        const result = await performHealthCheck(target);

        // Save check result
        await createMonitoringCheck({
          targetId: result.targetId,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          isSuccess: result.isSuccess,
          errorMessage: result.errorMessage,
        });

        // Check and trigger alerts
        await checkAndTriggerAlerts(
          target.id,
          target.userId,
          result.isSuccess
        );

        console.log(
          `[Monitoring] Target ${target.id} (${target.name}): ${result.isSuccess ? "✓" : "✗"}`
        );
      } catch (error) {
        console.error(`[Monitoring] Error checking target ${target.id}:`, error);
      }
    }

    console.log("[Monitoring] Monitoring cycle completed");
  } catch (error) {
    console.error("[Monitoring] Error during monitoring cycle:", error);
  }
}

/**
 * Start the monitoring service
 */
export function startMonitoringService(intervalSeconds: number = 60) {
  console.log(
    `[Monitoring] Service started with ${intervalSeconds}s interval`
  );

  // Run immediately
  runMonitoringCycle();

  // Run periodically
  setInterval(() => {
    runMonitoringCycle();
  }, intervalSeconds * 1000);
}
