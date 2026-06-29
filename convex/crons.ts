import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sync Linear issues every 5 minutes (AGT-192: reduced from 30s to save Convex costs)
// 12 calls/hour instead of 120 = 90% reduction
// Real-time updates still come via /api/webhooks/linear webhook
//
// DISABLED for self-hosted / local-only setups (no LINEAR_API_KEY).
// Tasks are created directly via the /new-task page → api.tasks.create.
// Re-enable by uncommenting if you wire Linear back up.
// crons.interval(
//   "sync-linear",
//   { minutes: 5 },
//   internal.linearSync.syncAll,
//   {}
// );

// AGT-119: Agent heartbeats — staggered 15-min intervals
// MAX at :00, SAM at :05, LEO at :10 of each 15-min window
crons.cron(
  "heartbeat-max",
  "0,15,30,45 * * * *", // Every 15 mins at :00, :15, :30, :45
  internal.heartbeat.heartbeatMax,
  {}
);

crons.cron(
  "heartbeat-sam",
  "5,20,35,50 * * * *", // Every 15 mins at :05, :20, :35, :50
  internal.heartbeat.heartbeatSam,
  {}
);

crons.cron(
  "heartbeat-leo",
  "10,25,40,55 * * * *", // Every 15 mins at :10, :25, :40, :55
  internal.heartbeat.heartbeatLeo,
  {}
);

// AGT-215: Alert System — Check for stuck agents every 7 minutes
// Triggers alerts when agents are stuck on a task for >30 minutes
// Staggered from sync-linear (5m) to reduce write conflicts
crons.interval(
  "check-stuck-agents",
  { minutes: 7 },
  internal.alerts.checkStuckAgents,
  {}
);

// AGT-216: Auto-Recovery — Self-Healing Agent Restart & Retry
// Checks for crashed agents (heartbeat timeout) and auto-restarts with backoff
// Circuit breaker stops after 3 consecutive failures
// Staggered to 6 min to avoid overlap with sync-linear (5m) and stuck-agents (7m)
crons.interval(
  "auto-recovery-check",
  { minutes: 6 },
  internal.recovery.runRecoveryCheck,
  {}
);

// AGT-223: Max Autonomous Monitor
// Background monitoring, self-check, agent sync, inter-agent coordination
// Checks: agent health, task progress, stuck tasks, errors
// Creates alerts but Telegram notifications are disabled until sendTelegramAlert is fixed
crons.interval(
  "max-monitor",
  { minutes: 15 },
  internal.maxMonitor.check,
  {}
);

// AGT-247: Event Bus — Cleanup expired events every 9 minutes
// Removes events older than 5 minutes that were never delivered
// Staggered to reduce cron overlap
crons.interval(
  "cleanup-expired-events",
  { minutes: 9 },
  internal.agentEvents.cleanupExpiredEvents,
  {}
);

// AGT-250: Website Health Monitor — Check every 1 minute
// Alerts via Telegram if site goes down
//
// DISABLED for self-hosted / local-only setups: it pings PRODUCTION URLs
// (evox-ten.vercel.app, *.convex.site) which read as "down" from a local
// deployment, spamming false alerts + Linear ticket attempts.
// Re-enable in production (and update HEALTH_ENDPOINTS in healthMonitor.ts).
// crons.interval(
//   "website-health-check",
//   { minutes: 1 },
//   internal.healthMonitor.checkWebsite,
//   {}
// );

// AGT-252: Auto-Recruit Agents — Check every 15 minutes
// Auto-spawns new agents when backlog is high or all agents busy
crons.interval(
  "auto-recruit-agents",
  { minutes: 15 },
  internal.agentTemplates.checkAndAutoSpawn,
  {}
);

// CORE-209 + AGT-337: The Loop — SLA Monitor every 8 minutes
// Detects AND auto-escalates: reply >15min → DM MAX, action >2h → critical MAX, report >24h → broken + CEO dispatch
// Staggered from sync-linear (5m) to reduce write conflicts
crons.interval(
  "loop-sla-monitor",
  { minutes: 8 },
  internal.loopMonitor.checkSLABreaches,
  {}
);

// CORE-209: The Loop — Hourly metrics aggregation
crons.cron(
  "loop-metrics-hourly",
  "0 * * * *", // Top of every hour
  internal.loopMetrics.aggregateHourlyMetrics,
  {}
);

// CORE-209: The Loop — Daily metrics for CEO dashboard
crons.cron(
  "loop-metrics-daily",
  "0 6 * * *", // 6:00 AM UTC daily
  internal.loopMetrics.aggregateDailyMetrics,
  {}
);

export default crons;
