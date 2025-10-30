import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  createMonitoringTarget,
  getMonitoringTargets,
  getMonitoringTargetById,
  updateMonitoringTarget,
  deleteMonitoringTarget,
  getMonitoringChecks,
  getRecentChecks,
  createAlertRule,
  getAlertRules,
  getAlertRulesByTarget,
  updateAlertRule,
  deleteAlertRule,
  getAlerts,
  getActiveAlerts,
  updateAlertStatus,
  getNotificationSettings,
  upsertNotificationSettings,
  getUptimeStatistics,
  createAuditLog,
  getAuditLogs,
} from "./db";
import { performHealthCheck, calculateUptimePercentage } from "./monitoring";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ MONITORING TARGETS ============
  targets: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getMonitoringTargets(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getMonitoringTargetById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          url: z.string().url(),
          description: z.string().optional(),
          protocol: z.enum(["http", "https"]).default("https"),
          method: z.enum(["GET", "POST", "HEAD"]).default("GET"),
          checkInterval: z.number().int().positive().default(60),
          timeout: z.number().int().positive().default(10),
          expectedStatusCode: z.number().int().default(200),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await createMonitoringTarget(ctx.user.id, input);
        
        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "MonitoringTarget",
          details: JSON.stringify(input),
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            url: z.string().optional(),
            description: z.string().optional(),
            protocol: z.enum(["http", "https"]).optional(),
            method: z.enum(["GET", "POST", "HEAD"]).optional(),
            checkInterval: z.number().int().positive().optional(),
            timeout: z.number().int().positive().optional(),
            expectedStatusCode: z.number().int().optional(),
            isActive: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.id, ctx.user.id);
        if (!target) throw new Error("Target not found");

        const result = await updateMonitoringTarget(
          input.id,
          ctx.user.id,
          input.data
        );

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "MonitoringTarget",
          entityId: input.id,
          details: JSON.stringify(input.data),
        });

        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.id, ctx.user.id);
        if (!target) throw new Error("Target not found");

        const result = await deleteMonitoringTarget(input.id, ctx.user.id);

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "MonitoringTarget",
          entityId: input.id,
        });

        return result;
      }),

    testCheck: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.id, ctx.user.id);
        if (!target) throw new Error("Target not found");

        return await performHealthCheck(target);
      }),
  }),

  // ============ MONITORING CHECKS ============
  checks: router({
    list: protectedProcedure
      .input(z.object({ targetId: z.number(), limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        return await getMonitoringChecks(input.targetId, input.limit);
      }),

    recent: protectedProcedure
      .input(z.object({ targetId: z.number(), hours: z.number().default(24) }))
      .query(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        return await getRecentChecks(input.targetId, input.hours);
      }),
  }),

  // ============ ALERT RULES ============
  alertRules: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getAlertRules(ctx.user.id);
    }),

    listByTarget: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .query(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        return await getAlertRulesByTarget(input.targetId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          targetId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          ruleType: z.enum([
            "consecutive_failures",
            "uptime_percentage",
            "response_time",
          ]),
          threshold: z.number().int().positive(),
          notificationChannels: z.array(
            z.enum(["email", "slack", "discord"])
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        const result = await createAlertRule({
          targetId: input.targetId,
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          ruleType: input.ruleType,
          threshold: input.threshold,
          notificationChannels: JSON.stringify(input.notificationChannels),
          isActive: true,
        });

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "CREATE",
          entityType: "AlertRule",
          details: JSON.stringify(input),
        });

        return result;
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            threshold: z.number().int().positive().optional(),
            notificationChannels: z.array(z.enum(["email", "slack", "discord"])).optional(),
            isActive: z.boolean().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const rules = await getAlertRules(ctx.user.id);
        const rule = rules.find((r) => r.id === input.id);
        if (!rule) throw new Error("Alert rule not found");

        const updateData: any = { ...input.data };
        if (input.data.notificationChannels) {
          updateData.notificationChannels = JSON.stringify(
            input.data.notificationChannels
          );
        }

        const result = await updateAlertRule(input.id, ctx.user.id, updateData);

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "AlertRule",
          entityId: input.id,
          details: JSON.stringify(input.data),
        });

        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const rules = await getAlertRules(ctx.user.id);
        const rule = rules.find((r) => r.id === input.id);
        if (!rule) throw new Error("Alert rule not found");

        const result = await deleteAlertRule(input.id, ctx.user.id);

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "DELETE",
          entityType: "AlertRule",
          entityId: input.id,
        });

        return result;
      }),
  }),

  // ============ ALERTS ============
  alerts: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return await getAlerts(ctx.user.id, input.limit);
      }),

    active: protectedProcedure.query(async ({ ctx }) => {
      return await getActiveAlerts(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["triggered", "acknowledged", "resolved"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const alerts = await getAlerts(ctx.user.id, 1000);
        const alert = alerts.find((a) => a.id === input.id);
        if (!alert) throw new Error("Alert not found");

        const result = await updateAlertStatus(input.id, input.status);

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "Alert",
          entityId: input.id,
          details: JSON.stringify({ status: input.status }),
        });

        return result;
      }),
  }),

  // ============ NOTIFICATION SETTINGS ============
  notificationSettings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificationSettings(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          emailEnabled: z.boolean().optional(),
          slackWebhookUrl: z.string().optional(),
          discordWebhookUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const result = await upsertNotificationSettings(ctx.user.id, input);

        // Log audit event
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE",
          entityType: "NotificationSettings",
          details: JSON.stringify(input),
        });

        return result;
      }),
  }),

  // ============ STATISTICS ============
  statistics: router({
    uptime: protectedProcedure
      .input(
        z.object({
          targetId: z.number(),
          period: z.enum(["daily", "weekly", "monthly"]),
          days: z.number().default(30),
        })
      )
      .query(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        return await getUptimeStatistics(
          input.targetId,
          input.period,
          input.days
        );
      }),

    summary: protectedProcedure
      .input(z.object({ targetId: z.number() }))
      .query(async ({ ctx, input }) => {
        const target = await getMonitoringTargetById(input.targetId, ctx.user.id);
        if (!target) throw new Error("Target not found");

        const checks = await getRecentChecks(input.targetId, 24);
        const uptime = await calculateUptimePercentage(input.targetId, checks);
        const avgResponseTime =
          checks.length > 0
            ? checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) /
              checks.length
            : 0;

        return {
          uptime,
          avgResponseTime: Math.round(avgResponseTime),
          totalChecks: checks.length,
          successfulChecks: checks.filter((c) => c.isSuccess).length,
          lastCheck: checks[0],
        };
      }),
  }),

  // ============ AUDIT LOGS ============
  auditLogs: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ ctx, input }) => {
        return await getAuditLogs(ctx.user.id, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
