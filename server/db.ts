import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  monitoringTargets,
  monitoringChecks,
  alertRules,
  alerts,
  notificationSettings,
  uptimeStatistics,
  auditLogs,
  MonitoringTarget,
  MonitoringCheck,
  AlertRule,
  Alert,
  NotificationSettings,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ MONITORING TARGET OPERATIONS ============

export async function createMonitoringTarget(
  userId: number,
  data: Omit<typeof monitoringTargets.$inferInsert, "userId">
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(monitoringTargets).values({
    ...data,
    userId,
  });

  return result;
}

export async function getMonitoringTargets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(monitoringTargets)
    .where(eq(monitoringTargets.userId, userId));
}

export async function getMonitoringTargetById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(monitoringTargets)
    .where(
      and(
        eq(monitoringTargets.id, id),
        eq(monitoringTargets.userId, userId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateMonitoringTarget(
  id: number,
  userId: number,
  data: Partial<typeof monitoringTargets.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(monitoringTargets)
    .set(data)
    .where(
      and(
        eq(monitoringTargets.id, id),
        eq(monitoringTargets.userId, userId)
      )
    );
}

export async function deleteMonitoringTarget(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(monitoringTargets)
    .where(
      and(
        eq(monitoringTargets.id, id),
        eq(monitoringTargets.userId, userId)
      )
    );
}

export async function getAllActiveTargets() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(monitoringTargets)
    .where(eq(monitoringTargets.isActive, true));
}

// ============ MONITORING CHECK OPERATIONS ============

export async function createMonitoringCheck(
  data: typeof monitoringChecks.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(monitoringChecks).values(data);
}

export async function getMonitoringChecks(
  targetId: number,
  limit: number = 100
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(monitoringChecks)
    .where(eq(monitoringChecks.targetId, targetId))
    .orderBy(desc(monitoringChecks.checkedAt))
    .limit(limit);
}

export async function getRecentChecks(
  targetId: number,
  hours: number = 24
) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await db
    .select()
    .from(monitoringChecks)
    .where(
      and(
        eq(monitoringChecks.targetId, targetId),
        gte(monitoringChecks.checkedAt, since)
      )
    )
    .orderBy(desc(monitoringChecks.checkedAt));
}

// ============ ALERT RULE OPERATIONS ============

export async function createAlertRule(
  data: typeof alertRules.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(alertRules).values(data);
}

export async function getAlertRules(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alertRules)
    .where(eq(alertRules.userId, userId));
}

export async function getAlertRulesByTarget(
  targetId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alertRules)
    .where(
      and(
        eq(alertRules.targetId, targetId),
        eq(alertRules.userId, userId)
      )
    );
}

export async function updateAlertRule(
  id: number,
  userId: number,
  data: Partial<typeof alertRules.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(alertRules)
    .set(data)
    .where(
      and(
        eq(alertRules.id, id),
        eq(alertRules.userId, userId)
      )
    );
}

export async function deleteAlertRule(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(alertRules)
    .where(
      and(
        eq(alertRules.id, id),
        eq(alertRules.userId, userId)
      )
    );
}

// ============ ALERT OPERATIONS ============

export async function createAlert(data: typeof alerts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(alerts).values(data);
}

export async function getAlerts(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.triggeredAt))
    .limit(limit);
}

export async function getActiveAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(alerts)
    .where(
      and(
        eq(alerts.userId, userId),
        eq(alerts.status, "triggered")
      )
    )
    .orderBy(desc(alerts.triggeredAt));
}

export async function updateAlertStatus(
  id: number,
  status: "triggered" | "acknowledged" | "resolved"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, any> = { status };
  if (status === "acknowledged") {
    updateData.acknowledgedAt = new Date();
  } else if (status === "resolved") {
    updateData.resolvedAt = new Date();
  }

  return await db
    .update(alerts)
    .set(updateData)
    .where(eq(alerts.id, id));
}

// ============ NOTIFICATION SETTINGS OPERATIONS ============

export async function getNotificationSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function upsertNotificationSettings(
  userId: number,
  data: Partial<typeof notificationSettings.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getNotificationSettings(userId);

  if (existing) {
    return await db
      .update(notificationSettings)
      .set(data)
      .where(eq(notificationSettings.userId, userId));
  } else {
    return await db.insert(notificationSettings).values({
      userId,
      ...data,
    });
  }
}

// ============ UPTIME STATISTICS OPERATIONS ============

export async function createUptimeStatistics(
  data: typeof uptimeStatistics.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(uptimeStatistics).values(data);
}

export async function getUptimeStatistics(
  targetId: number,
  period: "daily" | "weekly" | "monthly",
  days: number = 30
) {
  const db = await getDb();
  if (!db) return [];

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const sinceStr = since.toISOString().split("T")[0];

  return await db
    .select()
    .from(uptimeStatistics)
    .where(
      and(
        eq(uptimeStatistics.targetId, targetId),
        eq(uptimeStatistics.period, period),
        gte(uptimeStatistics.date, sinceStr)
      )
    )
    .orderBy(desc(uptimeStatistics.date));
}

// ============ AUDIT LOG OPERATIONS ============

export async function createAuditLog(
  data: typeof auditLogs.$inferInsert
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
