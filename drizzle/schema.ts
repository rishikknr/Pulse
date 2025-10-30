import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Monitoring targets - websites, APIs, or services to monitor
 */
export const monitoringTargets = mysqlTable("monitoring_targets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 2048 }).notNull(),
  description: text("description"),
  protocol: mysqlEnum("protocol", ["http", "https"]).default("https").notNull(),
  method: mysqlEnum("method", ["GET", "POST", "HEAD"]).default("GET").notNull(),
  checkInterval: int("checkInterval").default(60).notNull(), // in seconds
  timeout: int("timeout").default(10).notNull(), // in seconds
  expectedStatusCode: int("expectedStatusCode").default(200).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MonitoringTarget = typeof monitoringTargets.$inferSelect;
export type InsertMonitoringTarget = typeof monitoringTargets.$inferInsert;

/**
 * Monitoring checks - individual health check results
 */
export const monitoringChecks = mysqlTable("monitoring_checks", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  statusCode: int("statusCode"),
  responseTime: int("responseTime"), // in milliseconds
  isSuccess: boolean("isSuccess").notNull(),
  errorMessage: text("errorMessage"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

export type MonitoringCheck = typeof monitoringChecks.$inferSelect;
export type InsertMonitoringCheck = typeof monitoringChecks.$inferInsert;

/**
 * Alert rules - conditions for triggering alerts
 */
export const alertRules = mysqlTable("alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ruleType: mysqlEnum("ruleType", [
    "consecutive_failures",
    "uptime_percentage",
    "response_time",
  ]).notNull(),
  threshold: int("threshold").notNull(), // e.g., 3 for 3 consecutive failures
  notificationChannels: varchar("notificationChannels", { length: 500 }).notNull(), // JSON array: ["email", "slack", "discord"]
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

/**
 * Alerts - triggered alert events
 */
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("ruleId").notNull(),
  targetId: int("targetId").notNull(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["triggered", "acknowledged", "resolved"]).default("triggered").notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Notification settings - user preferences for alerts
 */
export const notificationSettings = mysqlTable("notification_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailEnabled: boolean("emailEnabled").default(true).notNull(),
  slackWebhookUrl: varchar("slackWebhookUrl", { length: 2048 }),
  discordWebhookUrl: varchar("discordWebhookUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;

/**
 * Uptime statistics - aggregated uptime data
 */
export const uptimeStatistics = mysqlTable("uptime_statistics", {
  id: int("id").autoincrement().primaryKey(),
  targetId: int("targetId").notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly"]).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  totalChecks: int("totalChecks").default(0).notNull(),
  successfulChecks: int("successfulChecks").default(0).notNull(),
  uptimePercentage: decimal("uptimePercentage", { precision: 5, scale: 2 }).default("100.00").notNull(),
  averageResponseTime: int("averageResponseTime").default(0), // in milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UptimeStatistics = typeof uptimeStatistics.$inferSelect;
export type InsertUptimeStatistics = typeof uptimeStatistics.$inferInsert;

/**
 * Audit logs - track user actions for compliance
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
